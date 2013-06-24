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
    'cookie-manager',
    'parser',
    'encoding',
    'util-lib',
    'logger'
  ], function($, _, Backbone, HttpLib, CookieManager, Parser, encoding, UtilLib, Logger) {

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
    var proto = _(Client.prototype);

    proto.extend({
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
            callback(this.parser.parseThreadList(http_response.body));
          });
      }
    });

    /**
     * @description スレッド一覧取得後、callback(Array)として呼び出される
     * @callback Client#getThreadList-callback
     * @param {Array} thread_list
     * スレッド情報の配列
     */

    proto.extend({
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
        this.http.get(
          url,
          _(this.HTTP_REQ_HEADERS_DEFAULT)
          .extend({
            'Host': hostname
          }))
          .done(function(http_response) {
            callback(parser.parseSettingText(http_response.body));
          });
      }
    });

    /**
     * @description 情報取得後 callback(Object)として呼び出される
     * @callback Client#getSettingText-callback
     * @param {Object} settings
     * 板の設定情報
     */

    proto.extend({
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
            callback(http_response);
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

    proto.extend({
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

        // 書き込みを行う
        var write = function write(ok_callback, fail_callback) {

          // 書き込み送信後にHTTPレスポンスヘッダを受け取る
          var receive_response = function receive_response(http_response) {
            var after_receive_response = function after_receive_response() {
              if (/書き込みました/.test(http_response.body))
                ok_callback(http_response.body);
              else
                fail_callback(http_response.body);
            };
            after_receive_response = after_receive_response.bind(this);

            var deferreds = [];

            // HTTPレスポンスヘッダにSet-Cookieがある場合の処理
            if (typeof http_response.headers['Set-Cookie'] !== 'undefined') {
              console.log('@putResponseToThread::write:receive_response');
              deferreds.push(this.cookie_manager.setCookieHeader(url, http_response.headers_source));
            }

            // 各処理が終わったらputResponseToThreadとしての結果を返す
            $.when.apply(null, deferreds)
              .done(after_receive_response);
          };
          receive_response = receive_response.bind(this);

          // 書き込み内容などをSJISに変換する
          var converted_response = _(response)
            .clone();
          _(converted_response)
            .each(function(value, key) {
              converted_response[key] = ConvertToSJIS(value);
            });

          // 書き込み内容などをパーセントエンコーディングでエスケープする
          var escaped_response = _(converted_response)
            .clone();
          _(escaped_response)
            .each(function(value, key) {
              escaped_response[key] = EscapeSJIS(value);
            });

          // 準備ができたら書き込む
          // TODO: 利用規約などを確認させるための処理が組めるような流れもつくる
          this.http.post(
            url,
            http_req_headers, {
              'bbs': board_id,
              'key': thread_id,
              'time': 1,
              'submit': ConvertToSJIS('上記全てを承諾して書き込む'),
              'FROM': escaped_response.name,
              'mail': escaped_response.mail,
              'MESSAGE': escaped_response.body,
              'yuki': 'akari'
            })
            .done(receive_response);
        };

        write = write.bind(this);


        var deferreds = $.when.apply(null, [
          this.cookie_manager.getCookieHeader(url)
          .done(function(cookie_header) {
            if (cookie_header === 'Cookie: ')
              return;
            _(http_req_headers)
              .extend({
                'Cookie': cookie_header.substr(7)
              });

          })
        ]);
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

    // 与えられた文字列をSJISに変換する

    function ConvertToUTF8(str) {
      return encoding.codeToString(encoding.convert(GetArray(str), 'UTF-8', 'SJIS'));
    }

    // 与えられた文字列をSJISに変換する

    function EscapeSJIS(str) {
      return _(str)
        .map(function(c) {
          return '%' + c.charCodeAt()
            .toString(16)
            .toUpperCase();
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
