var env = process.env.NODE_ENV || 'development';

try {
  var redis = JSON.parse(process.env.VCAP_SERVICES)["redis-2.2"][0].credentials;
} catch(e) {
  var redis = {
    host: "127.0.0.1",
    port: 6379,
  };
}

var defaults = {
  "static": {
    port: 3003
  },
  "socket": {
    options: {
      origins: '*:*',
      log: true,
      heartbeats: false,
      authorization: false,
      transports: [
        'websocket',
        'flashsocket',
        'htmlfile',
        'xhr-polling',
        'jsonp-polling'
      ],
      'log level': 1,
      'flash policy server': true,
      'flash policy port': 3013,
      'destroy upgrade': true,
      'browser client': true,
      'browser client minification': true,
      'browser client etag': true,
      'browser client gzip': false
    }
  },
  "nohm": {
    url: redis.host,
    port: redis.port,
    db: 7,
    prefix: 'node_stack',
    pw: redis.password
  },
  "redis": {
    url: redis.host,
    port: redis.port,
    db: 4,
    pw: redis.password
  },
  "sessions": {
    secret: require('fs').readFileSync(__dirname+"/session.key", "utf8"),
    db: 1
  }
};

if (env === 'production' || env === 'staging') {
  defaults["static"].port = 80;
}

if (env === 'staging') {
  defaults['static'].port = 3004;
}

module.exports = defaults;
