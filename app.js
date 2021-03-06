require(__dirname+'/helpers/pid.js');
var config = require(__dirname+'/config.js');
var express = require('express');
var registry = require(__dirname+'/registry.js');
var file_helper = require('./helpers/file.js');
var http = require('http');

var connector = require('./helpers/redisConnector');

connector.connect(function () {
    
    var model_files = file_helper.getFiles(__dirname, '/models/', ['validations.js']);
      
    model_files.forEach(function (val) {
      var name = val.match(/^\/models\/([\w]*)Model.js$/)[1];
      registry.Models[name] = require('.'+val);
    });
    
    var app = express();
    var server = http.createServer(app);
    
    app.use('/REST', require(__dirname+'/rest_server.js'));
    
    require('./static_file_server.js').init(app);
    
    
    server.listen(config['static'].port || 3000);
    
    require('./socket_server.js').init(server);
    
    console.log('Server listening on port ' + (config['static'].port || 3000) + '.');
    
});