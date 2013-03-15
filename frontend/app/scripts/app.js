/*global define */
define(
  ["libs/app", "backbone", "jquery", "models/userModel", "views/userView", "utility/overlay", "utility/i18n"], 
  function(App, Backbone, $, userModels, userViews, overlay) {
  'use strict';

  var app = window.app = new App();
  
  $("body").on('click', 'a.reload_page', function(e) {
    e.preventDefault();
    app.reload(true);
  });
  $("body").on('click', 'a.open_login', function(e) {
    e.preventDefault();
    overlay.overlay({
      view: 'login_needed'
    });
  });
  $("body").on('click','a.go_back', function(e) {
    e.preventDefault();
    window.history.back();
  });

  app.once('user_loaded', function() {
    app.userbox = new userViews.userbox();

    if (!userModels.user_self.get('name') && window.location.hash.length <= 1) {
      app.go('User/register');
    }

    Backbone.history.start();
  });
  window.app.user_self = userModels.user_self;
  window.app.user_self.load();

  $(document).ajaxError(function(event, jqXHR) {
    if (jqXHR.handled === true) {
      return;
    }
    var content_type = jqXHR.getResponseHeader('Content-Type');
    var error_msg;
    if (content_type.indexOf('/json') !== -1) {
      var json = $.parseJSON(jqXHR.responseText);
      error_msg = json.data.error.msg;
    }
    else {
      error_msg = 'Unknown Server Error';
      console.log('Unknown server error xhr:', jqXHR);
    }
    if (error_msg === 'need_login') {
      overlay.overlay({
        view: 'login_needed'
      });
    }
    else if (error_msg === 'not_found') {
      overlay.overlay({
        locals: {
          error: error_msg
        },
        view: 'not_found'
      });
    }
    else {
      overlay.overlay({
        locals: {
          error: error_msg
        },
        view: 'error'
      });
    }
  });
  
  return app;
});