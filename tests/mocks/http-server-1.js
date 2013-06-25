var createHttpServer = function createHttpServer(port) {
  var express = require('express');
  var app = express();

  app.configure('development', function() {
    app.use(express.static(__dirname + '/../fixtures'));
    app.use(express.bodyParser());

    app.get('/', function(req, res) {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Length', 5);
      res.end('index');
    });

    app.get('/test', function(req, res) {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Length', 4);
      res.end('test');
    });

    app.post('/', function(req, res) {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Length', 5);
      res.end('index');
    });

    app.post('/test', function(req, res) {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Length', 4);
      res.end('test');
    });

    app.post('/post-echo', function(req, res) {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Length', req.body.query.length);
      res.end(req.body.query);
    });

    app.get('/post-echo', function(req, res) {
      var body = [
        '<html>',
        '<body><form method="post" action="/post-echo">',
        '<input type="text" name="query" value="">',
        '<input type="submit" value="submit">',
        '</form></body>',
        '</html>'
      ];
      body = body.join('');
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Length', body.length);
      res.end(body);
    });

    app.get('/fuga', function(req, res) {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Length', 4);
      res.end('hoge');
    });
  });

  app.listen(port, '127.0.0.1', function() {});
}

module.exports = {
  createHttpServer: createHttpServer
};
