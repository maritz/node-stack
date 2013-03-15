define(
  ["backbone", "underscore", "utility/overlay", "libs/backbone/view", "templates/jade", "templates/form.compiled", "templates/page.compiled", "jgrowl"]
  , function (Backbone, _, overlay, baseView, jade, form, page) {
    
    window.jade = jade;
    
    return Backbone.Router.extend({
      
      models: {},
      collections: {},
      views: {},
      formHandler: {},
      current: {
        module: null,
        action: null,
        view: null
      },
      history: [],
      
      initialize: function (spec) {
        var self = this;
        this.config = {
          default_module: 'main',
          default_action: 'index',
          $content: $('#content'),
          $breadcrumb: $('#breadcrumb'),
          $navigation: $('#navigation'),
          $loading_overlay: $('#view_loading_overlay')
        };
        _.extend(this.config, spec);
    
        this.route('*args', 'routeToView', this.router);
        
        this.bind('login', function () {
          if (self.current.module !== null) {
            _.delay(function () { // make sure we're re-routed after the login
              self.navigation.call(self)
            }, 0, true);
          }
        });
        self.navigation();
      },
      
      router: function(route, force_rerender){
        var module = this.config.default_module,
            action = this.config.default_action,
            parameters = [],
            previous = this.current,
            self = this,
            orig_route = route;
            
        overlay.closeOverlay();
        self.history_add(orig_route);
        
        if (route !== '') {
          route = route.split('/');
          module = route[0].toLowerCase();
          if (route.length > 1 && route[1])
            action = route[1].toLowerCase();
          if (route.length > 2) {
            route.splice(0, 2);
            parameters = route;
          }
        }
        if ( ! module.match(/^[\w]+$/i) ) {
          module = this.config.default_module;
        }
        if ( ! action.match(/^[\w]+$/i) ) {
          action = this.config.default_action;
        }
        
        var data_expired = this.current.view ? this.current.view.isExpired() : false;
        
        if (this.current.orig_route === orig_route) {
          if (this.current.view !== null && ! force_rerender && ! data_expired) {
            console.log('data not stale, not reloading view');
            return false;
          }
        }
        
        try {
          self.current = {
            module: module,
            action: action,
            route: orig_route,
            view: this.view(module, action, null, parameters)
          };
          self.navigation();
          self.breadcrumb(parameters);
        } catch(e) {
          this.current = previous;
          if (e !== 'view_stop') {
            $.jGrowl('Sorry, there was an error while trying to process your action');
            console.log('Routing error in route '+route+':');
            console.log(e.stack);
            self.back();
          } else {
            console.log('view stopped rendering');
          }
        }
      },
      
      view: function(module, action, $el, params) {
        var self = this;
        var view;
        
        var after_render = function () {
          view.unbind(null, after_render);
          
          $el.siblings('.view_loading_overlay').remove();
          
          var is_view_current = !self.current.view || self.current.view.cid === view.cid;
          if (is_view_current && $el.hasClass('main_content') && $el[0].parentNode) {
            $el.siblings().remove();
          }
        };
        
        if (!$el) {
          $el = $('<div></div>')
                  .appendTo('#content')
                  .addClass('main_content '+module+' '+action);
        }
        $el.data('module', module);
        $el.data('action', action);
        
        var loading_overlay = this.template('page', 'view_loading_overlay', {
          _t: function (name) {
            return $.t(name);
          }
        });
        
        
        $el.siblings('.view_loading_overlay').remove();
        $el.after(loading_overlay);
        
        var view_options = {module: module, action: action, $el: $el, params: params};
        
        var handleAfterRender = function () {
          if (!view) {
            return false;
          }
          if (view.rendered) {
            after_render();
          } else {
            view.once('rendered', after_render);
            view.once('error', after_render);
          }
        };
        var viewUnavailable = function (err) {
          if (err === "action_404") {
            console.log('View "'+module+'" has no function "'+action+'". Trying to render default view. ('+module+':'+action+')');
          } else if (err.isInView === true) {
            throw err;
          } else {
            console.log('"views/'+module+'View.js" not found, trying to render default view. ('+module+':'+action+')', err);
          }
          view = new baseView.pageView(view_options);
          view.render();
          handleAfterRender();
        };
        require(["views/"+module+"View"], function (loaded_view) {
          if ( ! loaded_view[action] ) {
            // try to just load a template without a proper view
            viewUnavailable("action_404");
          } else {
            try {
              view = new loaded_view[action](view_options);
              handleAfterRender();
            } catch (e) {
              // if an error is thrown caught it is passed to viewUnavailable which then thinks the view is undefined if we don't tell it otherwise
              e.isInView = true;
              throw e;
            }
          }
        }, viewUnavailable);
      },
      
      go: function (str) {
        this.navigate('#'+str, true);
      },
      
      reload: function (force) {
        this.router(this.history[0] || '/', force);
      },
      
      back: function () {
        this.history.shift();
        this.navigate(this.history[0] || '', true);
        if (this.history.length > 0) {
          this.current = {
            module: this.config.default_module,
            action: this.config.default_action,
            route: '/'
          };
          this.navigation();
        }
      },
      
      history_add: function (route) {
        if (route !== this.history[0]) {
          this.history.unshift(route);
        }
        if (this.history.length > 20) {
          this.history.splice(20);
        }
      },
      
      breadcrumb: function (parameters) {
        return;
        var locals = _.extend({
            parameters: parameters && parameters.length && parameters[0].match(/[\d]*/) && parameters[0]
          }, this.current),
          self = this;
        this.template('page', 'breadcrumb', locals, function (html) {
          self.config.$breadcrumb.html(html);
        });
      },
      
      navigation: function  ()  {
        var self = this;
        var $nav = this.config.$navigation;
        self.template('page', 'top_navigation', {}, function (html) {
          $nav
            .html(html)
            .find('li')
              .removeClass('active');
          var $nav_matches = $nav
            .find('.nav > li')
              .has('a[href^="#'+self.current.module+'/'+self.current.action+'"]')
                .first()
                  .addClass('active');
          if ($nav_matches.length === 0) {
            $nav
              .find('.nav > li')
                .has('a[href^="#'+self.current.module+'"]')
                  .first()
                    .addClass('active');
          }
          
          var $subnav = $nav
            .find('ul.sub_navigation')
              .empty();
          if (self.current.module) {
            self.template(self.current.module, 'sub_navigation', {
                _t: function (name) {
                  return $.t(name, 'general', self.current.module);
                }
              }, function (html) {
              $subnav
                .html(html)
                .find('li')
                  .removeClass('active')
                .has('a[href^="#'+self.current.module+'/'+self.current.action+'"]')
                  .addClass('active');
            }); 
          }
        });
      },
      
      _templates: {
        form: form,
        page: page
      },
      _templates_loading: {},
      template: function (module, name, locals, callback) {
        var self = this;
        var html = '';
        
        locals = locals || {};
        
        _.extend(locals, {
          partial: function (name) {
            var args = _.toArray(arguments);
            args.shift();
            var locals_ = _.extend({},{
              parentLocals: locals,
              _t: locals._t,
              args: args
            });
            return self.template(module, name, locals_);
          },
          form: function (element, params) {
            params._t = locals._t;
            return self.template('form', element, params);
          }
        });
        
        if (self._templates[module]) {
          if ( ! self._templates[module][name]) {
            console.log('Template view "'+name+'" not found in module "'+module+'"');
            callback(false);
            return false;
          }
          
          html = self._templates[module][name](locals);
          if (typeof(callback) === 'function') {
            // make sure callback is async even if we already have the template asynchronous to make behaviour consistent
            setTimeout(function () {
              callback(html);
            }, 1);
          } else {
            return html;
          }
        } else {
          require(["templates/"+module+".compiled"], function (template) {
            if (!template) {
              console.log('Template module "'+module+'" not found.');
              callback(false);
              return false;
            }
            self._templates[module] = template;
            self.template(module, name, locals, callback);
          });
          return false;
        }
      }
    });
})