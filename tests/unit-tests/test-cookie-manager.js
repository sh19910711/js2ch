(function() {
  'use strict';

  describe('CookieManager', function() {

    before(function() {
      global.should = require('should');
      global.requirejs = require('./requirejs-config-node');
      global.jQuery = require('jquery');
      global.window = {
        jQuery: jQuery
      };
    });

    after(function() {
      require('child_process')
        .exec('rm test-*.db');
    });

    describe('#clear', function() {
      it('定義されているか確認する', function(done) {
        requirejs([
          'cookie-manager'
        ], function(CookieManager) {
          var cookie_manager = new CookieManager({
            storage: {
              target: 'test-cookie-manager-1.db'
            }
          });
          var type = typeof cookie_manager.clear;
          type.should.be.equal('function');
          done();
        });
      });
    });

    describe('#getCookieHeader', function() {
      it('定義されているか確認する', function(done) {
        requirejs([
          'cookie-manager'
        ], function(CookieManager) {
          var cookie_manager = new CookieManager({
            storage: {
              target: 'test-cookie-manager-2.db'
            }
          });
          var type = typeof cookie_manager.getCookieHeader;
          type.should.be.equal('function');
          done();
        });
      });
    });

    describe('#setCookieHeader', function() {
      it('定義されているか確認する', function(done) {
        requirejs([
          'cookie-manager'
        ], function(CookieManager) {
          var cookie_manager = new CookieManager({
            storage: {
              target: 'test-cookie-manager-3.db'
            }
          });
          var type = typeof cookie_manager.setCookieHeader;
          type.should.be.equal('function');
          done();
        });
      });
    });

    describe('#set', function() {
      it('定義されているか確認する', function(done) {
        requirejs([
          'cookie-manager'
        ], function(CookieManager) {
          var cookie_manager = new CookieManager({
            storage: {
              target: 'test-cookie-manager-4.db'
            }
          });
          var type = typeof cookie_manager.set;
          type.should.be.equal('function');
          done();
        });
      });
    });

    describe('experiments', function() {
      it('set-cookie', function(done) {
        requirejs([
          'underscore',
          'cookie-manager'
        ], function(_, CookieManager) {
          var cookie_manager = new CookieManager({
            storage: {
              target: 'test-cookie-manager-5.db'
            }
          });
          cookie_manager.clear()
            .done(function() {
              var http_response_list = [
                'HTTP/1.1 200 OK',
                'Set-Cookie: key1=value1; path=/; expires=Wed, 22-Jun-2033 09:07:54 GMT',
                'Set-Cookie: key2=value2; path=/; expires=Wed, 22-Jun-2033 09:07:54 GMT'
              ];
              http_response_list = _(http_response_list)
                .map(function(line) {
                  return line + '\r\n';
                });

              var http_response_text = http_response_list.join('');
              cookie_manager.setCookieHeader('http://www.example.com/', http_response_text)
                .done(function() {
                  cookie_manager.getCookieHeader('http://www.example.com/login')
                    .done(function(cookie_header) {
                      cookie_header.should.be.equal('Cookie: key1=value1; key2=value2');
                      done();
                    });
                });

            });
        });
      });

      it('set-cookie twice request', function(done) {
        requirejs([
          'underscore',
          'cookie-manager'
        ], function(_, CookieManager) {
          var cookie_manager = new CookieManager({
            storage: {
              target: 'test-cookie-manager-6.db'
            }
          });

          cookie_manager.clear()
            .done(function() {
              var http_response_list = [
                'HTTP/1.1 200 OK',
                'Set-Cookie: key1=value1; path=/; expires=Wed, 22-Jun-2033 09:07:54 GMT',
              ];
              http_response_list = _(http_response_list)
                .map(function(line) {
                  return line + '\r\n';
                });
              var http_response_text = http_response_list.join('');
              cookie_manager.setCookieHeader('http://www.example.com/', http_response_text)
                .done(function() {
                  var http_response_list = [
                    'HTTP/1.1 200 OK',
                    'Set-Cookie: key2=value2; path=/; expires=Wed, 22-Jun-2033 09:07:54 GMT',
                  ];
                  http_response_list = _(http_response_list)
                    .map(function(line) {
                      return line + '\r\n';
                    });
                  var http_response_text = http_response_list.join('');
                  cookie_manager.setCookieHeader('http://www.example.com/', http_response_text)
                    .done(function() {
                      cookie_manager.getCookieHeader('http://www.example.com/login')
                        .done(function(cookie_header) {
                          cookie_header.should.be.equal('Cookie: key1=value1; key2=value2');
                          done();
                        });
                    });
                });
            });

        });
      });

    });

  });

})();
