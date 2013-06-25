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
              },
              'storage': {
                'target': 'test-client-1.db'
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
              },
              'storage': {
                'target': 'test-client-2.db'
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
              },
              'storage': {
                'target': 'test-client-3.db'
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

      describe('書き込み系のテスト（confirm）', function() {
        it('Client#putResponseToThread', function(done) {
          requirejs([
            'jquery',
            'client'
          ], function($, Client) {
            var client = new Client({
              'cookie-manager': {
                'storage': {
                  'target': 'test-client-4.db'
                }
              },
              'storage': {
                'target': 'test-client-4.db'
              }
            });

            var deferred = new $.Deferred();

            var host = 'localhost:8080';
            var board_id = 'news4vip-confirm';
            var thread_id = 'confirm';
            var response_data = {
              name: 'test name',
              mail: 'test mail',
              body: 'test body'
            };

            var promise = client.putResponseToThread(host, board_id, thread_id, response_data);
            promise.fail(function(info) {
              if (info.type === 'confirm') {
                info.confirm()
                  .done(function() {
                    deferred.resolve();
                  })
                  .fail(function() {
                    throw new Error('エラーござる');
                  });
              }
              else {
                deferred.resolve();
              }
            });

            deferred.done(function() {
              // 2回目の書き込みはそのままいけるはず
              client.putResponseToThread(host, board_id, thread_id, response_data)
                .done(function() {
                  done();
                })
                .fail(function() {
                  throw new Error('エラーござる');
                });
            });

          });
        });
      });

    });

  });

})();
