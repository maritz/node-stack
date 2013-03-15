var express = require('express');
var Nohm = require('nohm').Nohm;

exports.init = function (server) {
  
  Nohm.setExtraValidations(__dirname+'/models/validations.js');
  server.use(Nohm.connect());
  server.use(express.compress());
  
  if (server.set('env') === 'development') {
    // pump everything to the yeoman server if it's running
    var request = require('request');
    server.get( '*', function (req, res) {
      request.get( 'http://127.0.0.1:3502/'+req.url, function (err) {
        if (err) {
          console.log( err, 'Is the yeoman server not running?');
          res.send({ error: 'Yeoman server not responding' }, 502);
        } else {
          request.get('http://127.0.0.1:3502/'+req.url).pipe(res);
        }
      });
    });
  } else {
    var oneDay = 86400000;
    server.use(express['static'](__dirname + '/frontend/dist/', { 
      maxAge: oneDay 
    }));
  }
};
