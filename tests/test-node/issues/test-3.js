(function() {
  'use strict';

  describe('HttpLib', function() {
    before(function() {
      global.requirejs = require('../requirejs-config');
    });

    // "ポート番号が指定してあるURLを読み込むことができない"
    describe('issue#3 https://github.com/sh19910711/js2ch/issues/3', function() {
      it('http://localhost:8654/testを取得する', function(done) {
        // local server
        var express = require('express');
        var app = express();
        app.get('/test', function(req, res) {
          done.call();
          return 'test';
        });
        app.listen(8654);

        requirejs([
          'http-lib'
        ], function(http) {
          http.get('http://localhost:8654/test', {}, function() {});
        });
      });
    });

  });
})();
