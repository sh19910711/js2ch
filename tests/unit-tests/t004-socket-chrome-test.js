(function() {
  'use strict';

  var should = require('should');
  var server_8080;

  describe('T001: Socket', function() {

    before(function() {
      global.requirejs = require('./requirejs-config-chrome');
      global.jQuery = require('jquery');
      global.window = {
        jQuery: jQuery
      };

      server_8080 = require('../mocks/http-server-1');
      server_8080.createHttpServer(8080);
    });

    after(function() {
      server_8080.close();
    });

    // 実験的なテスト
    describe('001: experiments', function() {
      describe('001: #create & #read & #write', function(done) {
        it('001: HTTP通信のテスト', function(done) {
          requirejs([
            'underscore',
            'jquery',
            'socket',
            'buffer-lib',
            'async',
            'purl'
          ], function(_, $, Socket, BufferLib, asyncjs, purl_dummy) {
            var socket = new Socket();
            var buffer_lib = new BufferLib();

            var http_get = function http_get(url) {
              var deferred = new $.Deferred();
              var url_obj = $.url(url);
              var host = url_obj.attr('host');
              var path = url_obj.attr('path');
              var port = url_obj.attr('port') || 80;

              socket.create('tcp', {}, function(socket_info) {
                var socket_id = socket_info.socketId;
                var http_response_text = '';

                socket.connect(socket_id, host, port, function() {

                  var send_http_request = function(callback) {
                    var BR, http_headers;
                    BR = '\r\n';
                    http_headers = ['GET ' + path + ' HTTP/1.0' + BR, 'Connection: close' + BR, BR].join('');
                    buffer_lib.convertToBuffer(http_headers, function(send_buf) {
                      socket.write(socket_id, send_buf, function() {
                        callback.call(null);
                      });
                    });
                  };

                  var receive_http_response = function(callback) {
                    var http_response_array_data = [];
                    var read = function read() {
                      socket.read(socket_id, 256, function(result) {
                        if (result.resultCode < 0) {
                          // ソケットはもう用無し
                          clearTimeout(timeout);
                          socket.destroy(socket_id);

                          // 残りのデータを読み込む
                          var array_data = [];
                          if (typeof result.data !== 'undefined') {
                            var uint8array = new Uint8Array(result.data);
                            _(uint8array)
                              .each(function(value) {
                                array_data.push(value);
                              });
                          }
                          http_response_array_data = http_response_array_data.concat(array_data);

                          buffer_lib.convertToString(http_response_array_data, function(text) {
                            http_response_text = text;
                            callback.call(null);
                          });
                        }
                        else {
                          // 取得したデータを配列に格納していく
                          var array_data = [];
                          var uint8array = new Uint8Array(result.data);
                          _(uint8array)
                            .each(function(value) {
                              array_data.push(value);
                            });
                          http_response_array_data = http_response_array_data.concat(array_data);
                          timeout = setTimeout(read, 0);
                        }
                      });
                    };
                    var timeout = setTimeout(read, 0);
                  };

                  asyncjs.series(
                    [
                      send_http_request,
                      receive_http_response
                    ], function() {
                      deferred.resolve(http_response_text);
                    }
                  );
                });
              });

              return deferred;
            };

            var check_status_200 = function check_status_200(http_response_text) {
              var status_line = 'HTTP/1.1 200 OK';
              var len = status_line.length;
              var response_status_line = http_response_text.split('\r\n')[0];
              status_line.should.equal(response_status_line);
            };

            var call_done = function() {
              done.call();
            };

            var deferred = $.when.apply(
              null, [
                http_get(
                  'http://localhost:8080/robots.txt'
                )
                .done(check_status_200)
              ]
            )
            deferred.done(call_done);
          });
        });
      });

      describe('002: #create', function() {
        it('001: ソケットを作成するたびにソケットの番号が増えていくことを確認する', function(done) {
          requirejs(['socket'], function(Socket) {
            var socket = new Socket();
            socket.create('tcp', {}, function(socket_info) {
              socket_info.should.have.property('socketId');
              socket.create('tcp', {}, function(next_socket_info) {
                next_socket_info.should.have.property('socketId');
                next_socket_info.socketId.should.be.equal(socket_info.socketId + 1);
              });
              done.call();
            });
          });
        });
      });

      describe('003: #create(deferred)', function() {
        it('001: ソケットを作成するたびにソケットの番号が増えていくことを確認する', function(done) {
          requirejs(['socket'], function(Socket) {
            var socket = new Socket();
            socket.create('tcp', {})
              .done(function(socket_info) {
                socket_info.should.have.property('socketId');
                socket.create('tcp', {})
                  .done(function(next_socket_info) {
                    next_socket_info.should.have.property('socketId');
                    next_socket_info.socketId.should.be.equal(socket_info.socketId + 1);
                  });
                done.call();
              });
          });
        });
      });

    });
  });

})();
