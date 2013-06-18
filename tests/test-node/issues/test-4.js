(function() {
  'use strict';

  var should = require('should');

  describe('Socket', function() {
    before(function() {
      global.requirejs = require('../requirejs-config');

      // local server
      var express = require('express');
      var app = express();
      app.get('/test', function(req, res) {
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Length', 4);
        res.end('test');
      });
      app.listen(8654);
    });

    // "socket#readで最後に残ったデータが受信できない"
    describe('issue#4 https://github.com/sh19910711/js2ch/issues/4', function() {
      it('http://localhost:8654/testを取得する', function(done) {
        requirejs([
          'http-lib'
        ], function(http) {
          http.get('http://localhost:8654/test', {}).done(function(res) {
            res.headers['Status-Code'].should.be.equal('200');
            res.headers['Content-Type'].should.be.equal('text/plain');
            res.body.should.be.equal('test');
            done();
          });
        });
      });
    });

  });
})();
