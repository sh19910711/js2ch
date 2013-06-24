(function() {
  var should = require('should');

  describe('Client', function() {
    before(function() {
      global.requirejs = require('./requirejs-config-node');
      global.jQuery = require('jquery');
      global.window = {
        jQuery: jQuery
      };
    });

    after(function() {
      require('child_process')
        .exec('rm test-client-*.db');
    });

    describe('experiments', function() {

      describe('取得系のテスト', function() {
        it('Client#getThreadList', function(done) {
          requirejs([
            'client'
          ], function(Client) {
            var client = new Client({
              'cookie-manager': {
                'storage': {
                  'target': 'test-client-1.db'
                }
              }
            });
            client.getThreadList('localhost:8080', 'news4vip', function(thread_list) {
              thread_list.length.should.be.equal(170);
              done();
            });
          });
        });

        it('Client#getThreadList (Deferred)', function(done) {
          requirejs([
            'client'
          ], function(Client) {
            var client = new Client({
              'cookie-manager': {
                'storage': {
                  'target': 'test-client-2.db'
                }
              }
            });
            client.getThreadList('localhost:8080', 'news4vip')
              .done(function(thread_list) {
                thread_list.length.should.be.equal(170);
                done();
              });
          });
        });
      });

      describe('書き込み系のテスト', function() {
        it('Client#putResponseToThread', function(done) {
          requirejs([
            'jquery',
            'client'
          ], function($, Client) {
            var client = new Client({
              'cookie-manager': {
                'storage': {
                  'target': 'test-client-3.db'
                }
              }
            });

            var promise = $.when.apply(null, [
              client.putResponseToThread('localhost:8080', 'news4vip', 'test', {
                name: 'test name',
                mail: 'test mail',
                body: 'test body'
              })
              .done(function(response) {})
              .fail(function(response) {}),

              client.putResponseToThread('localhost:8080', 'news4vip', 'test', {
                name: 'test name',
                mail: 'test mail',
                body: 'test body'
              })
              .done(function(response) {})
              .fail(function(response) {}),

              client.putResponseToThread('localhost:8080', 'news4vip', 'test', {
                name: 'test name',
                mail: 'test mail',
                body: 'test body'
              }, function(response) {}),
            ]);

            promise.done(function() {
              done();
            });

          });
        });
      });

    });

  });

})();
