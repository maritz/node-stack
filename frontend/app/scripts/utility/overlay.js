define(["underscore", "libs/bootstrap/modal"], function (_) {
  var exports = {};
  
  var $modal = $('#modal');
  $modal.modal({show: false});
  var default_locals = {
    header: 'Attention',
    buttons: ['Yes', 'No']
  };
  
  exports.overlay = function (options) {
    exports.closeOverlay();
    options = options || {};
    var template = options.view || options.template || null;
    var module = options.module || 'overlays';
    var locals = _.extend({
      _t: function (name, submodule, module_specific) {
        return $.t(name, submodule || template, module_specific || module);
      }
    }, default_locals, options.locals);
    
    if (options.confirm) {
      $modal.one('click', 'button.confirm', function () {
        $modal.off('hide', options.cancel);
        exports.closeOverlay();
        options.confirm();
      });
    }
    if (options.cancel) {
      $modal.one('hide', options.cancel);
    }
    if ( ! options.onRender) {
      options.onRender = function () {};
    }
    
    var renderModal = function () {
      window.app.template('page', 'modal', locals, function (modal_html) {
        if (typeof(modal_html) === 'string') {
          $modal.html(modal_html).modal('show');
          options.onRender($modal);
        } else {
          exports.closeOverlay();
          if (template !== 'error') {
            this.overlay = false;
            exports.overlay({view: 'error', locals: {error: 'Overlay view does not exist.'}});
          }
          console.log('error');
        }
      });
    };
    if (template) {
      window.app.template(module, template, locals, function (body) {
        locals.body = body;
        renderModal();
      });
    } else {
      renderModal();
    }
  };
  
  exports.closeOverlay = function () {
    $modal.modal('hide');
    $('.modal-backdrop').remove();
    $modal.off('click', 'button.confirm');
    $modal.off('click', 'button.cancel');
  };
  
  return exports;
  
});