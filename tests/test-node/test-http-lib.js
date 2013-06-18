(function() {
  'use strict';

  describe('HttpLib', function() {
    before(function() {
      global.requirejs = require('./requirejs-config');
    });

    describe('#get', function() {

      // "socket#readで最後に残ったデータが受信できない"
      describe('issue#4 https://github.com/sh19910711/js2ch/issues/4', function() {
        it('http://www.google.co.jp/humans.txtを取得する', function(done) {
          requirejs([
            'http-lib'
          ], function(http) {
            var deferred = http.get(
              'http://www.google.co.jp/humans.txt', {}
            );
            deferred.done(function(response) {
              var expected = "Google is built by a large team of engineers, designers, researchers, robots, and others in many different sites across the globe. It is updated continuously, and built with more tools and technologies than we can shake a stick at. If you'd like to help us out, see google.com/jobs.";
              response.body.should.be.equal(expected);
              done.call();
            });
          });
        });

        it('http://www.google.co.jp:80/humans.txtを取得する', function(done) {
          requirejs([
            'http-lib'
          ], function(http) {
            var deferred = http.get(
              'http://www.google.co.jp:80/humans.txt', {}
            );
            deferred.done(function(response) {
              var expected = "Google is built by a large team of engineers, designers, researchers, robots, and others in many different sites across the globe. It is updated continuously, and built with more tools and technologies than we can shake a stick at. If you'd like to help us out, see google.com/jobs.";
              response.body.should.be.equal(expected);
              done.call();
            });
          });
        });
      });

    });

  });
})();
