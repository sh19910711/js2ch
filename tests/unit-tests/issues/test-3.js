(function() {
  'use strict';

  var should = require('should');
  var server_8654;

  describe('HttpLib', function() {
    before(function() {
      global.requirejs = require('../requirejs-config-node');
      server_8654 = require('../../mocks/http-server-1');
      server_8654.createHttpServer(8654);
    });

    after(function() {
      server_8654.close();
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
