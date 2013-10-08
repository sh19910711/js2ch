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
 * @fileOverview 2ch専用ブラウザ・クライアント用のライブラリ
 * @author Hiroyuki Sano
 */
(function() {
  'use strict';

  var root = this;

  define([
    'jquery',
    'underscore',
    'backbone',
    'http-lib',
    'storage',
    'cookie-manager',
    'parser',
    'encoding',
    'util-lib',
    'logger'
  ], function($, _, Backbone, HttpLib, Storage, CookieManager, Parser, encoding, UtilLib, Logger) {

    var STORAGE_FORM_APPEND_PARAMS = 'form_append_params';

    /**
     * @constructor Client
     */
    var Client = function(options, callback_context) {
      callback_context = callback_context || this;
      options = (options && options['client']) || options || {};

      /**
       * @description HTTPリクエスト時に渡すヘッダのリスト
       * @memberof Client
       *
       */
      this.HTTP_REQ_HEADERS_DEFAULT = {
        'User-Agent': 'Monazilla/1.00'
      };

      this.http = new HttpLib((options && options['http-lib']) || options, this);
      this.parser = new Parser((options && options['parser']) || options, this);
      this.logger = new Logger((options && options['logger']) || options, this);
      this.storage = new Storage((options && options['storage']) || options, this);
      this.cookie_manager = new CookieManager((options && options['cookie-manager']) || options || {}, this);

      // Deferredの設定
      var keys = ['getThreadList', 'getSettingText', 'getResponsesFromThread'];
      _(keys)
        .each(function(key) {
          this[key] = UtilLib.getDeferredFunc(this[key], this, callback_context);
        }, this);

      // Deferredの設定（失敗する可能性があるもの）
      var keys = ['putResponseToThread'];
      _(keys)
        .each(function(key) {
          this[key] = UtilLib.getDeferredFuncWillFail(this[key], this, callback_context);
        }, this);
    };

    Client.prototype = {};
    var proto_extend = function(obj) {
      _.extend(Client.prototype, obj);
    };

    proto_extend({
      /**
       * @description スレッド一覧を取得する
       * @memberof Client
       *
       * @param {String} hostname
       * ホスト名
       * @param {String} board_id
       * 板ID
       * @param {Client#getThreadList-callback} callback
       * スレッド一覧取得後、callback(Array) として呼び出される。
       */
      getThreadList: function getThreadList(hostname, board_id, callback) {
        var url = GetUrl(hostname, '/' + board_id + '/subject.txt');
        this.http.get(
          url,
          _(this.HTTP_REQ_HEADERS_DEFAULT)
          .extend({
            'Host': hostname,
          }))
          .done(function(http_response) {
            callback(this.parser.parseThreadList(ConvertToUTF8(http_response.body)));
          });
      }
    });

    /**
     * @description スレッド一覧取得後、callback(Array)として呼び出される
     * @callback Client#getThreadList-callback
     * @param {Array} thread_list
     * スレッド情報の配列
     */

    proto_extend({
      /**
       * @description [未実装] SETTING.TXTを取得する
       * @memberof Client
       *
       * @param {String} hostname
       * ホスト名
       * @param {String} board_id
       * 板ID
       * @param {Client#getSettingText-callback} callback
       * 情報取得後 callback(Object) として呼び出される
       */
      getSettingText: function getSettingText(hostname, board_id, callback) {
        var url = GetUrl(hostname, '/' + board_id + '/SETTING.TXT');
        var http_request_headers = this.HTTP_REQ_HEADERS_DEFAULT;

        _(http_request_headers)
          .extend({
            'Host': hostname
          });

        this.http.get(url, http_request_headers)
          .done(function(http_response) {
            callback(this.parser.parseSettingText(ConvertToUTF8(http_response.body)));
          });
      }
    });

    /**
     * @description 情報取得後 callback(Object)として呼び出される
     * @callback Client#getSettingText-callback
     * @param {Object} settings
     * 板の設定情報
     */

    proto_extend({
      /**
       * @description スレッドの書き込みを取得する
       * @memberof Client
       *
       * @param {String} hostname
       * ホスト名
       * @param {String} board_id
       * 板ID
       * @param {String} thread_id
       * スレッドID
       * @param {Client#getResponsesFromThread-callback} callback
       * 書き込み一覧を取得後 callback(Array) として呼び出される
       */
      getResponsesFromThread: function getResponsesFromThread(hostname, board_id, thread_id, callback) {
        var url = GetUrl(hostname, '/' + board_id + GetDatPath(hostname, thread_id));
        this.http.get(
          url,
          _(this.HTTP_REQ_HEADERS_DEFAULT)
          .extend({
            'Host': hostname
          }))
          .done(function(http_response) {
            callback(this.parser.parseResponsesFromThread(ConvertToUTF8(http_response.body)));
          });
      }
    });

    /**
     * @description 書き込み一覧を取得後 callback(Array) として呼び出される
     * @callback Client#getResponsesFromThread-callback
     *
     * @param {Array} responses
     * スレッドに書き込まれたレスのリスト
     */

    proto_extend({
      // スレッドに書き込む
      /**
       * @description スレッドに書き込みを行う
       * @memberof Client
       *
       * @param {String} hostname
       * ホスト名
       * @param {String} board_id
       * 板ID
       * @param {String} thread_id
       * スレッドID
       * @param {Object} response
       * 書き込み内容
       * @param {Client#putResponseToThread-callback} callback
       * 書き込み完了後 callback(Object) として呼び出される
       */
      putResponseToThread: function putResponseToThread(hostname, board_id, thread_id, response, ok_callback, fail_callback) {
        var url = GetUrl(hostname, '/test/bbs.cgi?guid=ON');

        var http_req_headers = _(this.HTTP_REQ_HEADERS_DEFAULT)
          .extend({
            'Host': hostname,
            'Referer': GetUrl(hostname, '/' + board_id + '/')
          });
        var http_req_params = {};

        // 書き込みを行う
        var write = function write(ok_callback, fail_callback) {

          // 書き込み送信後にHTTPレスポンスヘッダを受け取る
          var receive_response = function receive_response(http_response) {

            // HTTPレスポンス受信後の処理（callbackの実行）
            var after_receive_response = function after_receive_response() {

              // 書き込み確認後の処理
              var confirm_callback = function confirm_callback_func() {
                var promise = new $.Deferred();

                // 不足しているパラメータを追加して保存し、再書き込みを行う
                this.storage.get(STORAGE_FORM_APPEND_PARAMS)
                  .done(function(items) {
                    // ストレージに設定できたら再書き込みを行う
                    var after_storage_set = function after_storage_set_func() {
                      this.putResponseToThread(hostname, board_id, thread_id, response)
                        .done(promise.resolve)
                        .fail(promise.reject);
                    };
                    after_storage_set = after_storage_set.bind(this);


                    // 不足しているパラメータを取得する
                    var new_form_params = this.parser.parseFormFromHTML(ConvertToUTF8(http_response.body))['../test/bbs.cgi?guid=ON'].params;
                    _(_.keys(http_req_params))
                      .each(function(key) {
                        if (typeof new_form_params[key] === 'undefined')
                          delete new_form_params[key];
                        else if (key === 'FROM' || key === 'MESSAGE' || key === 'mail' || key === 'time')
                          delete new_form_params[key];
                        else if (http_req_params[key] === new_form_params[key])
                          delete new_form_params[key];
                        else
                          new_form_params[key] = ConvertToSJIS(new_form_params[key].toString());
                      });

                    // オブジェクトじゃなかったらオブジェクトにしておく
                    if (typeof items[STORAGE_FORM_APPEND_PARAMS] !== 'object')
                      items[STORAGE_FORM_APPEND_PARAMS] = {};

                    // ストレージに保存しておく
                    _(items[STORAGE_FORM_APPEND_PARAMS])
                      .extend(new_form_params);
                    this.storage.set(items)
                      .done(after_storage_set);
                  });

                return promise;
              };
              confirm_callback = confirm_callback.bind(this);


              var title_text = this.parser.parseTitleFromHTML(ConvertToUTF8(http_response.body));

              if ('書きこみました。' === title_text) {
                ok_callback(ConvertToUTF8(http_response.body));
              }
              else if ('■ 書き込み確認 ■' === title_text) {
                fail_callback({
                  type: 'confirm',
                  httpResponse: http_response,
                  confirm: confirm_callback
                });
              }
              else {
                fail_callback({
                  type: 'error',
                  httpResponse: http_response
                });
              }

            };
            after_receive_response = after_receive_response.bind(this);


            // HTTPレスポンスヘッダにSet-Cookieがある場合の処理
            var check_cookie = function check_cookie_func() {
              var deferred = new $.Deferred();
              if (typeof http_response.headers['Set-Cookie'] !== 'undefined') {
                this.cookie_manager.setCookieHeader(url, http_response.headers_source)
                  .done(function() {
                    deferred.resolve();
                  });
              }
              else {
                deferred.resolve();
              }
              return deferred;
            };
            check_cookie = check_cookie.bind(this);


            // リクエスト受信後のCookieなどの処理 
            var promise = $.when.apply(null, [
              check_cookie()
            ]);
            promise.done(after_receive_response);
          };
          receive_response = receive_response.bind(this);


          // 準備ができたらPOSTリクエストを送信する
          var send_http_request = function send_http_request_func() {
            this.http.post(url, http_req_headers, http_req_params)
              .done(receive_response);
          };
          send_http_request = send_http_request.bind(this);


          // 追加のパラメータがあれば追加する（yuki=akariなどの対応）
          var add_http_req_params = function add_http_req_params_func() {
            var promise = this.storage.get(STORAGE_FORM_APPEND_PARAMS)
            promise.done(function(items) {
              _(http_req_params)
                .extend(items[STORAGE_FORM_APPEND_PARAMS]);
            });
            return promise;
          };
          add_http_req_params = add_http_req_params.bind(this);


          // 送信直前に必要な処理を行う（パラメータの追加など）
          var promise = $.when.apply(null, [
            add_http_req_params()
          ]);

          // 各処理が済んだらリクエストを送信
          promise.done(send_http_request);
        };
        write = write.bind(this);


        // リクエスト前に送信するクエリを準備する
        var prepare_http_req_params = function prepare_http_req_params() {
          var deferred = new $.Deferred();

          var func = function func() {
            // 書き込み内容などをSJISに変換する
            var converted_response = _.clone(response);
            _(converted_response)
              .each(function(value, key) {
                converted_response[key] = ConvertToSJIS(value);
              });

            // 書き込み内容などをパーセントエンコーディングでエスケープする
            var escaped_response = _.clone(converted_response)
            _(escaped_response)
              .each(function(value, key) {
                escaped_response[key] = EscapeSJIS(value);
              });

            // 送信するデータ
            _(http_req_params)
              .extend({
                'subject': '',
                'bbs': board_id,
                'key': thread_id,
                'time': 1,
                'submit': ConvertToSJIS('書き込む'),
                'FROM': escaped_response.name,
                'mail': escaped_response.mail,
                'MESSAGE': escaped_response.body,
              });

            deferred.resolve();
          };
          func = func.bind(this);


          setTimeout(func, 0);

          return deferred;
        };
        prepare_http_req_params = prepare_http_req_params.bind(this);


        // 取得したCookieをHTTPリクエストヘッダに追加する
        var after_get_cookie_header = function after_get_cookie_header_func(cookie_header) {
          if (cookie_header === 'Cookie: ')
            return;
          _(http_req_headers)
            .extend({
              'Cookie': cookie_header.substr(8)
            });
        };

        // リクエスト前に送信するCookieを準備する
        var prepare_cookie = function prepare_cookie_func() {
          var promise = this.cookie_manager.getCookieHeader(url);
          promise.done(after_get_cookie_header);
          return promise;
        };
        prepare_cookie = prepare_cookie.bind(this);


        // リクエスト前の準備
        var deferreds = $.when.apply(null, [
          prepare_cookie(),
          prepare_http_req_params()
        ]);

        // 準備ができたらwriteを実行する
        deferreds.done(function() {
          write(ok_callback, fail_callback);
        });
      }
    });

    /**
     * @description 書き込み完了後 callback(Object) として呼び出される
     * @callback Client#putResponseToThread-callback
     *
     * @param {Object} http_response
     * HTTPレスポンス
     */


    // ホスト名とパスを繋げたURLを返す

    function GetUrl(hostname, path) {
      return 'http://' + hostname + path;
    }

    // DATファイルのパスを返す

    function GetDatPath(hostname, thread_id) {
      return '/dat/' + thread_id + '.dat';
    }

    // 与えられた文字列をSJISに変換する

    function ConvertToSJIS(str) {
      return encoding.codeToString(encoding.convert(GetArray(str), 'SJIS', 'AUTO'));
    }

    // 与えられた文字列をUTF-8に変換する

    function ConvertToUTF8(str) {
      return encoding.codeToString(encoding.convert(GetArray(str), 'UNICODE', 'AUTO'));
    }

    // 与えられた文字列をSJISに変換する

    function EscapeSJIS(str) {
      return _(str)
        .map(function(c) {
          var code = c.charCodeAt()
            .toString(16)
            .toUpperCase();
          while (code.length < 2)
            code = "0" + code;
          return '%' + code;
        })
        .join('');
    }

    // 文字列を配列に変換する

    function GetArray(str) {
      var res = [];
      _(str.split(''))
        .each(function(c) {
          res.push(c.charCodeAt());
        });
      return res;
    }

    return Client;
  });

})();
