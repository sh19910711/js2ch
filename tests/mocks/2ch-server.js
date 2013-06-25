(function() {
  'use strict';

  module.exports = {
    createServer: function(port) {
      console.log('2ch mock server start');

      var requirejs = require('requirejs');
      var _ = require('underscore');

      requirejs.config({
        baseUrl: './',
        paths: {
          'encoding': './lib/encoding',
          'buffer-lib': './sources/buffer-lib-node',
          'logger': './sources/logger',
          'formatter': './sources/formatter',
          'util-lib': './sources/util-lib'
        }
      });

      // 文字列を配列に変換する

      function GetArray(str) {
        var res = [];
        _(str.split(''))
          .each(function(c) {
            res.push(c.charCodeAt());
          });
        return res;
      }


      // https://www.google.co.jp/search?q=%E6%9B%B8%E3%81%8D%E8%BE%BC%E3%81%BF%E3%81%BE%E3%81%97%E3%81%9F

      requirejs(['encoding', 'buffer-lib'], function(encoding, BufferLib) {
        var buffer_lib = new BufferLib();
        var express = require('express');
        var app = express();

        app.configure(function() {
          var path = require('path');
          app.use(express.static(__dirname + '/../fixtures/2ch'));
          app.use(express.bodyParser());

          app.post('/test/bbs.cgi', function(req, res) {
            if (req.body.key === 'test') {
              var body = '<title>書き込みました。</title>';
              body = encoding.convert(body, 'SJIS', 'AUTO');
              buffer_lib.convertToString(body)
                .done(function(str) {
                  buffer_lib.getByteLength(str)
                    .done(function(len) {
                      res.setHeader('Content-Type', 'text/html');
                      res.setHeader('Content-Length', len);
                      res.end(str);
                    });
                });
            }
            else if (req.body.key === 'confirm') {
              if (req.body.yuki === 'akari') {
                var body = [
                  '<html>',
                  '<head>',
                  '<title>書き込みました。</title>',
                  '</head>',
                  '<body>',
                  '<form action="../test/bbs.cgi?guid=ON">',
                  '<input type="hidden" name="subject" value="">',
                  '<input type="hidden" name="FROM" value="' + req.body['FROM'] + '">',
                  '<input type="hidden" name="mail" value="' + req.body['mail'] + '">',
                  '<input type="hidden" name="MESSAGE" value="' + req.body['MESSAGE'] + '">',
                  '<input type="hidden" name="bbs" value="' + req.body['bbs'] + '">',
                  '<input type="hidden" name="time" value="' + req.body['time'] + '">',
                  '<input type="hidden" name="key" value="' + req.body['key'] + '">',
                  '<input type="hidden" name="yuki" value="akari">',
                  '</form>',
                  '</body>',
                  '</html>'
                ].join('');
                body = encoding.convert(body, 'SJIS', 'AUTO');
                buffer_lib.convertToString(body)
                  .done(function(str) {
                    buffer_lib.getByteLength(str)
                      .done(function(len) {
                        res.setHeader('Content-Type', 'text/html');
                        res.setHeader('Content-Length', len);
                        res.end(str);
                      });
                  });
              }
              else {
                var body = [
                  '<html>',
                  '<head>',
                  '<title>■ 書き込み確認 ■</title>',
                  '</head>',
                  '<body>',
                  '<form action="../test/bbs.cgi?guid=ON">',
                  '<input type="hidden" name="subject" value="">',
                  '<input type="hidden" name="FROM" value="' + req.body['FROM'] + '">',
                  '<input type="hidden" name="mail" value="' + req.body['mail'] + '">',
                  '<input type="hidden" name="MESSAGE" value="' + req.body['MESSAGE'] + '">',
                  '<input type="hidden" name="bbs" value="' + req.body['bbs'] + '">',
                  '<input type="hidden" name="time" value="' + req.body['time'] + '">',
                  '<input type="hidden" name="key" value="' + req.body['key'] + '">',
                  '<input type="hidden" name="yuki" value="akari">',
                  '</form>',
                  '</body>',
                  '</html>'
                ].join('');
                body = encoding.convert(body, 'SJIS', 'AUTO');
                buffer_lib.convertToString(body)
                  .done(function(str) {
                    buffer_lib.getByteLength(str)
                      .done(function(len) {
                        res.setHeader('Content-Type', 'text/html');
                        res.setHeader('Content-Length', len);
                        res.end(str);
                      });
                  });
              }
            }
          });

          app.post('/post-echo', function(req, res) {
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Length', req.body.query.length);
            res.end(req.body.query);
          });
        });


        app.listen(port, '127.0.0.1');
      });
    }
  };

})();
