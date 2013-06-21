(function() {
  'use strict';

  var should = require('should');

  describe('HttpLib', function() {
    before(function() {
      global.requirejs = require('../requirejs-config-node');
    });

    // "ポート番号が指定してあるURLを読み込むことができない"
    describe('issue#3 https://github.com/sh19910711/js2ch/issues/3', function() {

      it('http://localhost:8654/testを取得する', function(done) {
        requirejs([
          'http-lib'
        ], function(HttpLib) {
          var http = new HttpLib();
          http.get('http://localhost:8654/test', {})
            .done(function(res) {
              res.headers['Status-Code'].should.be.equal('200');
              res.body.should.be.equal('test');
              done();
            });
        });
      });

      it('http://localhost:8654/fugaを取得する', function(done) {
        requirejs([
          'http-lib'
        ], function(HttpLib) {
          var http = new HttpLib();
          http.get('http://localhost:8654/fuga', {})
            .done(function(res) {
              res.headers['Status-Code'].should.be.equal('200');
              res.body.should.be.equal('hoge');
              done();
            });
        });
      });

    });

  });
})();
