var createHttpServer = function createHttpServer(port) {
  var express = require('express');
  var app = express();

  app.get('/test', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Length', 4);
    res.end('test');
  });

  app.get('/fuga', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Length', 4);
    res.end('hoge');
  });

  app.configure(function() {
    var path = require('path');
    app.use(express.static(__dirname + '/../fixtures'));
  });

  app.listen(port, '127.0.0.1', function() {
  });
}

module.exports = {
  createHttpServer: createHttpServer
};
