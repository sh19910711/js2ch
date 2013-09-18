(function() {
  'use strict';

  var server_8654;

  describe('HttpLib', function() {

    before(function() {
      global.should = require('should');
      global.requirejs = require('./requirejs-config-node');
      global.jQuery = require('jquery');
      global.window = {
        jQuery: jQuery
      };

      server_8654 = require('../mocks/http-server-1')
        .createHttpServer(8654);
    });

    after(function() {
      server_8654.close();
    });

    describe('#get', function() {
      it('GETリクエスト http://localhost/test', function(done) {
        requirejs([
          'http-lib'
        ], function(HttpLib) {
          var http_lib = new HttpLib();
          http_lib.get('http://localhost/test', {})
            .done(function(response) {
              response.body.should.be.equal('test');
              done();
            });
        });
      });

      it('GETリクエスト(IPアドレス) http://127.0.0.1/test', function(done) {
        requirejs([
          'http-lib'
        ], function(HttpLib) {
          var http_lib = new HttpLib();
          http_lib.get('http://127.0.0.1/test', {})
            .done(function(response) {
              response.body.should.be.equal('test');
              done();
            });
        });
      });

      it('GETリクエスト http://localhost:80/test', function(done) {
        requirejs([
          'http-lib'
        ], function(HttpLib) {
          var http_lib = new HttpLib();
          http_lib.get('http://localhost/test', {})
            .done(function(response) {
              response.body.should.be.equal('test');
              done();
            });
        });
      });

      it('GETリクエスト(IPアドレス) http://127.0.0.1:80/test', function(done) {
        requirejs([
          'http-lib'
        ], function(HttpLib) {
          var http_lib = new HttpLib();
          http_lib.get('http://127.0.0.1/test', {})
            .done(function(response) {
              response.body.should.be.equal('test');
              done();
            });
        });
      });

      it('GETリクエスト（ポート番号） http://localhost:8654/test', function(done) {
        requirejs([
          'http-lib'
        ], function(HttpLib) {
          var http_lib = new HttpLib();
          http_lib.get('http://localhost:8654/test', {})
            .done(function(response) {
              response.body.should.be.equal('test');
              done();
            });
        });
      });

      it('GETリクエスト(IPアドレス) http://127.0.0.1:8654/test', function(done) {
        requirejs([
          'http-lib'
        ], function(HttpLib) {
          var http_lib = new HttpLib();
          http_lib.get('http://127.0.0.1:8654/test', {})
            .done(function(response) {
              response.body.should.be.equal('test');
              done();
            });
        });
      });

      it('GETリクエスト http://localhost/', function(done) {
        requirejs([
          'http-lib'
        ], function(HttpLib) {
          var http_lib = new HttpLib();
          http_lib.get('http://localhost/', {})
            .done(function(response) {
              response.body.should.be.equal('index');
              done();
            });
        });
      });

      it('GETリクエスト(IPアドレス) http://127.0.0.1/', function(done) {
        requirejs([
          'http-lib'
        ], function(HttpLib) {
          var http_lib = new HttpLib();
          http_lib.get('http://127.0.0.1/', {})
            .done(function(response) {
              response.body.should.be.equal('index');
              done();
            });
        });
      });

      it('GETリクエスト http://localhost', function(done) {
        requirejs([
          'http-lib'
        ], function(HttpLib) {
          var http_lib = new HttpLib();
          http_lib.get('http://localhost', {})
            .done(function(response) {
              response.body.should.be.equal('index');
              done();
            });
        });
      });

      it('GETリクエスト(IPアドレス) http://127.0.0.1', function(done) {
        requirejs([
          'http-lib'
        ], function(HttpLib) {
          var http_lib = new HttpLib();
          http_lib.get('http://127.0.0.1', {})
            .done(function(response) {
              response.body.should.be.equal('index');
              done();
            });
        });
      });

    });

    describe('#post', function() {
      it('POSTリクエスト http://localhost/test', function(done) {
        requirejs([
          'http-lib'
        ], function(HttpLib) {
          var http_lib = new HttpLib();
          http_lib.post('http://localhost/test', {}, {})
            .done(function(response) {
              response.body.should.be.equal('test');
              done();
            });
        });
      });

      it('POSTリクエスト(IPアドレス) http://127.0.0.1/test', function(done) {
        requirejs([
          'http-lib'
        ], function(HttpLib) {
          var http_lib = new HttpLib();
          http_lib.post('http://127.0.0.1/test', {}, {})
            .done(function(response) {
              response.body.should.be.equal('test');
              done();
            });
        });
      });

      it('POSTリクエスト http://localhost:80/test', function(done) {
        requirejs([
          'http-lib'
        ], function(HttpLib) {
          var http_lib = new HttpLib();
          http_lib.post('http://localhost/test', {}, {})
            .done(function(response) {
              response.body.should.be.equal('test');
              done();
            });
        });
      });

      it('POSTリクエスト(IPアドレス) http://127.0.0.1:80/test', function(done) {
        requirejs([
          'http-lib'
        ], function(HttpLib) {
          var http_lib = new HttpLib();
          http_lib.post('http://127.0.0.1/test', {}, {})
            .done(function(response) {
              response.body.should.be.equal('test');
              done();
            });
        });
      });

      it('POSTリクエスト（ポート番号） http://localhost:8654/test', function(done) {
        requirejs([
          'http-lib'
        ], function(HttpLib) {
          var http_lib = new HttpLib();
          http_lib.post('http://localhost:8654/test', {}, {})
            .done(function(response) {
              response.body.should.be.equal('test');
              done();
            });
        });
      });

      it('POSTリクエスト(IPアドレス) http://127.0.0.1:8654/test', function(done) {
        requirejs([
          'http-lib'
        ], function(HttpLib) {
          var http_lib = new HttpLib();
          http_lib.post('http://127.0.0.1:8654/test', {}, {})
            .done(function(response) {
              response.body.should.be.equal('test');
              done();
            });
        });
      });

      it('POSTリクエスト http://localhost/', function(done) {
        requirejs([
          'http-lib'
        ], function(HttpLib) {
          var http_lib = new HttpLib();
          http_lib.post('http://localhost/', {}, {})
            .done(function(response) {
              response.body.should.be.equal('index');
              done();
            });
        });
      });

      it('POSTリクエスト(IPアドレス) http://127.0.0.1/', function(done) {
        requirejs([
          'http-lib'
        ], function(HttpLib) {
          var http_lib = new HttpLib();
          http_lib.post('http://127.0.0.1/', {}, {})
            .done(function(response) {
              response.body.should.be.equal('index');
              done();
            });
        });
      });

      it('POSTリクエスト http://localhost', function(done) {
        requirejs([
          'http-lib'
        ], function(HttpLib) {
          var http_lib = new HttpLib();
          http_lib.post('http://localhost', {}, {})
            .done(function(response) {
              response.body.should.be.equal('index');
              done();
            });
        });
      });

      it('POSTリクエスト(IPアドレス) http://127.0.0.1', function(done) {
        requirejs([
          'http-lib'
        ], function(HttpLib) {
          var http_lib = new HttpLib();
          http_lib.post('http://127.0.0.1', {}, {})
            .done(function(response) {
              response.body.should.be.equal('index');
              done();
            });
        });
      });

      it('POSTリクエスト(echo)', function(done) {
        requirejs([
          'http-lib'
        ], function(HttpLib) {
          var http_lib = new HttpLib();
          var promise = http_lib.post('http://127.0.0.1/post-echo', {}, {
            query: 'postest'
          });
          promise.done(function(response) {
            response.body.should.be.equal('postest');
            done();
          });
        });
      });

    });

  });

})();
