(function() {
  var should = require('should');
  var server_8080;

  describe('T001: Client', function() {
    before(function() {
      global.requirejs = require('./requirejs-config-node');
      global.jQuery = require('jquery');
      global.window = {
        jQuery: jQuery
      };

      server_8080 = require('../mocks/2ch-server');
      server_8080.createServer(8080);
    });

    after(function() {
      require('child_process')
        .exec('rm test-client-*.db');
      server_8080.close();
    });

    describe('001: experiments', function() {
      describe('001: 取得系のテスト', function() {
        it('001: Client#getThreadList', function(done) {
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

        it('002: Client#getThreadList (Deferred)', function(done) {
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

      describe('002: 書き込み系のテスト', function() {
        it('001: Client#putResponseToThread', function(done) {
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

      describe('003: 書き込み系のテスト（confirm）', function() {
        it('001: Client#putResponseToThread', function(done) {
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
                    throw new Error('エラーござる @ info.confirm.fail');
                  });
              }
              else {
                throw new Error('エラーござる @ info.type !== confirm');
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

      describe('004: 書き込み系のテスト（本文に改行を含む）', function() {
        it('001: Client#putResponseToThread', function(done) {
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
              client.putResponseToThread('localhost:8080', 'news4vip', 'test2', {
                name: 'test name',
                mail: 'test mail',
                body: 'test1\ntest2\ntest3\n'
              })
              .done(function(response) {
                var ret = response.match(/<body>([\s\S]*?)<\/body>/m)[1];
                ret.should.be.equal('test1\ntest2\ntest3\n');
              })
              .fail(function(response) {})
            ]);

            promise.done(function() {
              done();
            });
          });
        });
      });

      describe('005: レスポンスの取得', function() {
        it('001: Client#getResponsesFromThread', function(done) {
          requirejs([
            'client'
          ], function(Client) {
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
            client.getResponsesFromThread('localhost:8080', 'news4vip', '1379534723', function(responses) {
              responses.length.should.be.equal(75);
              responses[0].name.data.should.be.equal("以下、名無しにかわりましてVIPがお送りします");
              responses[0].mail.data.should.be.equal("");
              responses[0].info.data.should.be.equal("2013/09/19(木) 05:05:23.77 ID:TZ0akNcn0");
              responses[0].body.data.should.be.equal("お、おさない <br> は、はしらない <br> し、しんでる <br>  <br>  <br> みたいな");
              responses[45].mail.data.should.be.equal("sage");
              done();
            });
          });
        });
      });


      describe('006: 取得系のテスト', function() {
        it('001: Client#getThreadList', function(done) {
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
      });
    });

    describe('007: SETTING.TXTの取得', function() {
      it('001: Client#getSettingText', function(done) {
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
          client.getSettingText('localhost:8080', 'news4vip', function(obj) {
            obj['BBS_TITLE'].should.be.equal('ニュース速報(VIP)＠２ちゃんねる');
            obj['BBS_NONAME_NAME'].should.be.equal('以下、名無しにかわりましてVIPがお送りします');
            obj['BBS_NINJA'].should.be.equal('checked');
            done();
          });
        });
      });
      it('002: Client#getSettingText (Deferred)', function(done) {
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
          client.getSettingText('localhost:8080', 'news4vip')
            .done(function(obj) {
              obj['BBS_TITLE'].should.be.equal('ニュース速報(VIP)＠２ちゃんねる');
              obj['BBS_NONAME_NAME'].should.be.equal('以下、名無しにかわりましてVIPがお送りします');
              obj['BBS_NINJA'].should.be.equal('checked');
              obj['timecount'].should.be.equal('15');
              done();
            });
        });
      });
    })

  });

})();
