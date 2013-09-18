(function() {
  'use strict';

  var should = require('should');
  var server_8654;

  describe('Socket', function() {
    before(function() {
      global.requirejs = require('../requirejs-config-node');
      server_8654 = require('../../mocks/http-server-1')
        .createHttpServer(8654);
    });

    after(function() {
      server_8654.close();
    });

    // "socket#readで最後に残ったデータが受信できない"
    describe('issue#4 https://github.com/sh19910711/js2ch/issues/4', function() {
      it('http://localhost:8654/testを取得する', function(done) {
        requirejs([
          'http-lib'
        ], function(HttpLib) {
          var http = new HttpLib();
          http.get('http://localhost:8654/test', {})
            .done(function(res) {
              res.headers['Status-Code'].should.be.equal('200');
              res.headers['Content-Type'].should.be.equal('text/plain');
              res.body.should.be.equal('test');
              done();
            });
        });
      });

      it('http://localhost/humans.txtを取得する', function(done) {
        requirejs([
          'http-lib'
        ], function(HttpLib) {
          var http = new HttpLib();
          var deferred = http.get(
            'http://localhost/humans.txt', {}
          );
          deferred.done(function(response) {
            var expected = "Google is built by a large team of engineers, designers, researchers, robots, and others in many different sites across the globe. It is updated continuously, and built with more tools and technologies than we can shake a stick at. If you'd like to help us out, see google.com/jobs.\n";
            response.body.should.be.equal(expected);
            done.call();
          });
        });
      });

      it('http://localhost:80/humans.txtを取得する', function(done) {
        requirejs([
          'http-lib'
        ], function(HttpLib) {
          var http = new HttpLib();
          var deferred = http.get(
            'http://localhost:80/humans.txt', {}
          );
          deferred.done(function(response) {
            var expected = "Google is built by a large team of engineers, designers, researchers, robots, and others in many different sites across the globe. It is updated continuously, and built with more tools and technologies than we can shake a stick at. If you'd like to help us out, see google.com/jobs.\n";
            response.body.should.be.equal(expected);
            done.call();
          });
        });
      });
    });

  });
})();
