(function() {
  'use strict';


  var should = require('should');

  describe('Socket', function() {

    before(function() {
      global.requirejs = require('./requirejs-config');
      global.jQuery = require('jquery');
      global.window = {
        jQuery: jQuery
      };
    });

    describe('#create', function() {
      it('ソケットを作成するたびにソケットの番号が増えていくことを確認する', function(done) {
        requirejs(['socket'], function(socket) {
          socket.create('tcp', {}, function(socket_info) {
            socket_info.should.have.property('socketId');
            socket_info.socketId.should.be.equal(0);
            socket.create('tcp', {}, function(socket_info) {
              socket_info.should.have.property('socketId');
              socket_info.socketId.should.be.equal(1);
            });
            done.call();
          });
        });
      });

      it('HTTP通信のテスト', function(done) {
        requirejs([
          'underscore',
          'jquery',
          'socket',
          'buffer-lib',
          'async',
          'purl'
        ], function(_, $, socket, buffer_lib, asyncjs, purl_dummy) {
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
            var status_line = 'HTTP/1.0 200 OK';
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
                'http://www.google.co.jp/robots.txt'
              )
              .done(check_status_200)
            ]
          )
          deferred.done(call_done);
        });
      });
    });
  });

})
  .call(this);
