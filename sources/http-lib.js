/* ===================================================
 * JavaScript 2ch-client Library
 * https://github.com/sh19910711/js2ch
 * ===================================================
 * Copyright (c) 2013 Hiroyuki Sano
 *
 * Licensed under MIT License.
 * http://opensource.org/licenses/MIT
 * =================================================== */
/**
 * @fileOverview HTTP通信関連の操作を行うライブラリ
 * @author Hiroyuki Sano
 */
(function() {
  'use strict';

  var root = this;

  define([
    'jquery',
    'underscore',
    'socket',
    'purl',
    'async',
    'util-lib',
    'buffer-lib',
    'logger'
  ], function($, _, Socket, purl, async, UtilLib, BufferLib, Logger) {

    var BR = "\r\n";
    var DEFAULT_HTTP_PORT = 80;

    /**
     * @constructor HttpLib
     */
    var HttpLib = function(options, callback_context) {
      callback_context = callback_context || this;
      options = (options && options['http-lib']) || options;

      this.socket = new Socket((options && options['socket']) || options, this);
      this.buffer_lib = new BufferLib((options && options['buffer_lib']) || options, this);
      this.logger = new Logger((options && options['logger']) || options, this);

      // Deferredの設定
      var keys = ['get', 'post'];
      _(keys)
        .each(function(key) {
          this[key] = UtilLib.getDeferredFunc(this[key], this, callback_context);
        }, this);
    };

    HttpLib.prototype = {};
    var proto_extend = function(obj) {
      _.extend(HttpLib.prototype, obj);
    };

    proto_extend({
      /**
       * @description GETリクエストを行う
       * @memberof HttpLib
       *
       * @param {String} url
       * GETリクエストを行うURL
       * @param {Object} http_headers_obj
       * HTTPリクエストヘッダーの設定
       * @param {HttpLib#get-callback} callback
       * HTTPレスポンスが帰ってきたら callback(Object) として呼び出される
       */
      get: function get(url, http_headers_obj, callback) {
        // CreateSocket -> SendHttpRequest -> ReceiveHttpResponse

        var http_response = {};
        var url_obj = $.url(url);
        var connect_info = {
          host: url_obj.attr('host'),
          path: url_obj.attr('path') || '/',
          port: parseInt(url_obj.attr('port') || DEFAULT_HTTP_PORT, 10)
        };
        var socket_id;

        // ソケットを作成する
        var create_socket = function create_socket_func(callback) {
          this.socket.create('tcp', {})
            .done(function(info) {
              socket_id = info.socketId;
              callback(null);
            });
        };
        create_socket = create_socket.bind(this);

        // HTTPリクエストを送る
        var send_http_request = function send_http_request_func(callback) {
          this.socket.connect(socket_id, connect_info.host, connect_info.port)
            .done(function() {
              var get_buffer_callback = function get_buffer_callback_func(send_buf) {
                this.socket.write(socket_id, send_buf)
                  .done(function() {
                    callback(null);
                  });
              };
              get_buffer_callback = get_buffer_callback.bind(this);

              var http_headers = [];
              http_headers.push('GET ' + connect_info.path + ' HTTP/1.0' + BR);
              _(_.keys(http_headers_obj))
                .each(function(key) {
                  http_headers.push(key + ': ' + http_headers_obj[key] + BR);
                });
              http_headers.push('Connection: close' + BR);
              http_headers.push(BR);

              var http_headers_text = http_headers.join('');
              this.buffer_lib.convertToBuffer(http_headers_text)
                .done(get_buffer_callback);
            });
        };
        send_http_request = send_http_request.bind(this);

        // HTTPレスポンスを受け取る
        var receive_http_response = function receive_http_response_func(callback) {
          // 読み取り
          var read = function read_func() {
            this.socket.read(socket_id, 256)
              .done(function(result) {
                if (result.resultCode < 0) {
                  clearTimeout(timeout);
                  this.socket.destroy(socket_id);

                  // バイトデータを文字列に変換する
                  this.buffer_lib.convertToString(http_response_array_data)
                    .done(function(converted_text) {
                      http_response = GetResponse(converted_text);
                      callback(null);
                    });
                }
                else {
                  var arr = [];

                  // 取得したデータを配列に変換する
                  var u8 = new Uint8Array(result.data);
                  _(u8)
                    .each(function(value) {
                      arr.push(value);
                    });

                  http_response_array_data = http_response_array_data.concat(arr);
                  timeout = setTimeout(read, 0);
                }
              });
          };
          read = read.bind(this);

          var http_response_array_data = [];
          var http_response_text = '';
          var timeout = setTimeout(read, 0);
        };
        receive_http_response = receive_http_response.bind(this);

        async.series([
          create_socket,
          send_http_request,
          receive_http_response
        ], function() {
          callback(http_response);
        });
      }
    });

    /**
     * @description GETリクエスト送信後, HTTPレスポンスが帰ってきたら callback(Object) として呼び出される
     * @callback HttpLib#get-callback
     *
     * @param {Object} http_response
     * HeaderとBodyに分けて返す
     */

    proto_extend({
      /**
       * @description 指定したURLにPOSTリクエストを行う
       * @memberof HttpLib
       *
       * @param {String} url
       * POSTリクエストを行うURL
       * @param {Object} http_headers_obj
       * HTTPリクエストヘッダ
       * @param {Object} data
       * クエリ
       * @param {HttpLib#post-callback} callback
       * HTTPレスポンスが返ってきたら callback(Object) として呼び出される
       */
      post: function post(url, http_headers_obj, data, callback) {
        var http_response = {};
        var url_obj = $.url(url);
        var connect_info = {
          host: url_obj.attr('host'),
          path: url_obj.attr('path') || '/',
          query: url_obj.attr('query'),
          port: url_obj.attr('port') || DEFAULT_HTTP_PORT
        };
        var socket_id;

        // ソケットを作成する
        var create_socket = function create_socket_func(callback) {
          this.socket.create('tcp', {})
            .done(function(info) {
              socket_id = info.socketId;
              callback(null);
            })
        };
        create_socket = create_socket.bind(this);

        // HTTPリクエストを送る
        var send_http_request = function send_http_request_func(callback) {
          this.socket.connect(socket_id, connect_info.host, connect_info.port)
            .done(function() {
              var get_buffer_callback = function get_buffer_callback_func(send_buf) {
                this.socket.write(socket_id, send_buf, function() {
                  callback(null);
                });
              };
              get_buffer_callback = get_buffer_callback.bind(this);

              var after_get_byte_length = function after_get_byte_length_func(query_length) {
                if (connect_info.query != '')
                  path += '?' + connect_info.query;

                http_headers.push('POST ' + path + ' HTTP/1.1' + BR);
                _(_.keys(http_headers_obj))
                  .each(function(key) {
                    http_headers.push(key + ': ' + http_headers_obj[key] + BR);
                  });
                http_headers.push('Content-Type: application/x-www-form-urlencoded' + BR);
                http_headers.push('Content-Length: ' + query_length + BR);
                http_headers.push('Connection: close' + BR);
                http_headers.push(BR);
                http_headers.push(query);

                var http_headers_text = http_headers.join('');
                this.buffer_lib.convertToBuffer(http_headers_text)
                  .done(get_buffer_callback);
              };
              after_get_byte_length = after_get_byte_length.bind(this);

              var http_headers = [];
              var path = connect_info.path;
              var query = ConvertToQueryString(data);

              this.buffer_lib.getByteLength(query)
                .done(after_get_byte_length);
            });
        };
        send_http_request = send_http_request.bind(this);

        var receive_http_response = function receive_http_response_func(callback) {
          // 読み取り
          var read = function read_func() {
            this.socket.read(socket_id, 256)
              .done(function(result) {
                if (result.resultCode < 0) {
                  clearTimeout(timeout);
                  http_response_array_data = _(http_response_array_data)
                    .map(function(v) {
                      return v;
                    });
                  this.socket.destroy(socket_id);
                  this.buffer_lib.convertToString(http_response_array_data)
                    .done(function(converted_text) {
                      http_response = GetResponse(converted_text);
                      callback(null);
                    });
                }
                else {
                  var arr = [];
                  var u8 = new Uint8Array(result.data);
                  _(u8)
                    .each(function(value) {
                      arr.push(value);
                    });
                  http_response_array_data = http_response_array_data.concat(arr);
                  timeout = setTimeout(read, 0);
                }
              });
          };
          read = read.bind(this);

          var http_response_array_data = [];
          var http_response_text = '';
          var timeout = setTimeout(read, 0);
        };
        receive_http_response = receive_http_response.bind(this);

        async.series([
          create_socket,
          send_http_request,
          receive_http_response
        ], function() {
          callback(http_response);
        });
      }
    });

    /**
     * @description POSTリクエスト送信後、HTTPレスポンスが返ってきたら callback(Object)として呼び出される
     * @callback HttpLib#post-callback
     *
     * @param {Object} http_response
     * HTTPレスポンスのHeaderとBody
     */


    // HTTPレスポンスのヘッダ部をオブジェクトにする

    function ParseHeaderText(header_text) {
      var http_headers = header_text.split(BR);

      // HTTPレスポンスのステータスを取得する（200とか404とか）
      var status_line = http_headers[0].split(' ');

      var lines = http_headers.slice(1);
      var terms = lines.map(function(line) {
        return UtilLib.splitString(line, ':')
          .map($.trim);
      });
      var response_headers = {
        'HTTP-Version': status_line[0],
        'Status-Code': status_line[1]
      };

      terms.forEach(function(term) {
        response_headers[term[0]] = term[1];
      });

      return response_headers;
    }

    // HTTPレスポンスからヘッダ部を取り出す

    function GetHeaderText(http_response) {
      return UtilLib.splitString(http_response, BR + BR)[0];
    }

    // HTTPレスポンスからボディ部分を取り出す

    function GetBodyText(http_response) {
      return UtilLib.splitString(http_response, BR + BR)[1];
    }

    // オブジェクトをクエリ用の文字列に変換する

    function ConvertToQueryString(data) {
      return _(_.keys(data))
        .map(function(key) {
          return key + '=' + data[key];
        })
        .join('&');
    }

    // HTTPレスポンステキストをオブジェクトに変換する

    function GetResponse(http_response_text) {
      var response_headers = ParseHeaderText(GetHeaderText(http_response_text));
      var http_response = {
        headers: response_headers,
        headers_source: GetHeaderText(http_response_text),
        body: GetBodyText(http_response_text)
      };
      return http_response;
    }

    return HttpLib;
  });

})();
