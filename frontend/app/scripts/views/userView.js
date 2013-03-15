define(["underscore", "libs/backbone/view", "models/userModel", "collections/userCollection", "utility/overlay"], function (_, baseView, userModels, userCollections, overlay) {
  var exports = {};
  
  /**
   * #/user/index
   */
  exports.index = baseView.listView.extend({
    
    collection: userCollections.User,
    auto_render: true,
    requires_login: true
    
  });
  
  /**
   * #/user/register
   */
  exports.register = baseView.formView.extend({
    
    auto_render: true,
    model: userModels.User,
    max_age: 0,
    wait_for_user_loaded: false,
    reload_on_login: true,
    
    render: function () {
      var self = this;
      if (userModels.user_self.get('name')) {
        window.app.back();
      } else {
        baseView.formView.prototype.render.apply(self, _.toArray(arguments));
      }
    },
    
    saved: function () {
      this.reload_on_login = false; // we only want to reload if the login is not from here.
      window.app.once('user_loaded', function () {
        window.app.go('user/profile/');
        window.app.trigger('login');
      });
      userModels.user_self.load();
    }
    
  });
  
  /**
   * #/user/profile
   */
  exports.profile = baseView.pageView.extend({
    
    auto_render: true,
    model: userModels.User,
    requires_login: true,
    
    load: function (callback) {
      var self = this;
      var id = this.params[0] || userModels.user_self.id;
      this.model.set({'id': id});
      this.model.fetch()
        .always(function (res) {
          callback(res.status >= 400, self.model);
        });
    }
    
  });
  
  /**
   * #/user/edit_profile(/:id)
   */
  exports.edit_profile = baseView.formView.extend({
    
    auto_render: true,
    model: userModels.User,
    max_age: 0,
    requires_login: true,
    
    edit_is_self: false,
    
    events: {
      'click form.acl label a': 'markAclInputs',
      'change .acl :checkbox': 'changeAcl',
      'change .admin :checkbox': 'changeAdmin'
    },
    
    init: function () {
      var default_acl = ['view', 'list', 'create', 'edit', 'delete'];
      this.addLocals({
        acl: {
          'User': ['self'].concat(default_acl.concat(['grant']))
        }
      });
    },
    
    load: function (callback) {
      if (this.params[0] && userModels.user_self.may('edit', 'User')) {
        this.model.id = this.params[0];
      } else {
        this.model.id = userModels.user_self.id;
        this.edit_is_self = true;
      }
      this.model.fetch(function (user) {
        callback(null, user);
      });
    },
    
    saved: function () {
      if (this.edit_is_self) {
        userModels.user_self.set(this.model.toJSON());
      }
      window.app.go('user/profile/'+this.model.id);
    },
    
    markAclInputs: function (e) {
      var $target = $(e.target);
      var boxes = $target.closest('.control-group').find(':checkbox');
      if ($target.hasClass('setRead')) {
        boxes
          .filter('[data-action="view"], [data-action="list"]')
          .click();
      }
      if ($target.hasClass('setWrite')) {
        boxes
          .filter('[data-action="create"], [data-action="edit"], [data-action="delete"]')
          .click();
      }
    },
    
    getChangeCallback: function ($target, checked) {
      return function (err) {
        var class_name = 'success_blink';
        if (err) {
          class_name = 'error_blink';
          $target.prop('checked', !checked);
        }
        var $parent = $target.parent().addClass(class_name);
        setTimeout(function () {
          $target.attr('disabled', false);
          $parent.removeClass(class_name);
        }, 500);
      };
    },
    
    changeAcl: function (e) {
      var $target = $(e.target);
      var checked = $target.prop('checked');
      var allow_or_deny = checked ? 'allow' : 'deny';
      $target.attr('disabled', true);
      this.model.changeAcl(allow_or_deny, $target.data('action'), $target.data('subject'), this.getChangeCallback($target, checked));
    },
    
    changeAdmin: function (e) {
      var self = this;
      var $target = $(e.target);
      var checked = $target.prop('checked');
      var name = this.model.get('name');
      var done = self.getChangeCallback($target, checked);
      var cancel = function () {
        $target.prop('checked', !checked);
        $target.attr('disabled', false);
      };
      
      $target.attr('disabled', true);
      
      if ( ! checked) {
        if (this.model.id === userModels.user_self.id) {
          overlay.overlay({
            view: 'confirm_take_self_admin',
            locals: {
              text: this._t('admin.self_warning')
            },
            confirm: function () {
              self.model.changeAdmin(false, done);
            },
            cancel: cancel
          });
        } else {
          self.model.changeAdmin(false, done);
        }
      } else {
        overlay.overlay({
          view: 'confirm_grant_admin',
          locals: {
            text: this._t(['admin.grant_warning', name])
          },
          confirm: function () {
            self.model.changeAdmin(true, done);
          },
          cancel: cancel
        });
      }
    }
    
  });
  
  
  /**
   * #/user/login or manual call
   */
  exports.login = baseView.formView.extend({
    
    model: userModels.user_self,
    
    auto_render: true,
    max_age: 0,
    wait_for_user_loaded: false,
    reload_on_login: false,
    
    events: {
      "click a[href='#user/register']": "closeOverlay"
    },
    
    init: function () {
      var self = this;
      this.bind('rendered', function () {
        self.$el.find('input[type="text"]').focus();
      });
    },
    
    /**
     * Login successful
     */
    saved: function () {
      $.jGrowl('Login successful');
      userModels.user_self.set(this.model.toJSON());
      
      if (window.app.current.view instanceof exports.login) {
        window.app.go('#');
      } else {
        overlay.closeOverlay();
      }
      
      window.app.trigger('login');
    },
    
    closeOverlay: function () {
      overlay.closeOverlay();
    }
    
  });
  
  
  /**
   * #/user/logout
   */
  exports.logout = baseView.pageView.extend({
    requires_login: true,
    init: function () {
      if (userModels.user_self) {
        userModels.user_self.logout();
      }
    }
  });
  
  /**
   * Userbox
   */
  exports.userbox = baseView.pageView.extend({
    
    model: userModels.user_self,
    
    module: 'user',
    action: 'userbox',
    
    el: $('#userbox'),
    auto_render: true,
    
    init: function () {
      this.model.bind('change:name', this.render);
    },
    
    load: function (callback) {
      callback(null, userModels.user_self);
    }
  });
  
  return exports;
  
});