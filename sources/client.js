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
    'logger',
    'client-put-utils'
  ], function($, _, Backbone, HttpLib, Storage, CookieManager, Parser, encoding, UtilLib, Logger, PutUtils) {
    /**
     * @constructor Client
     */
    var Client = function(options, callback_context) {
      callback_context = callback_context || this;
      options = (options && options['client']) || options || {};
      this.STORAGE_FORM_APPEND_PARAMS = 'form_append_params';

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
      var keys = ['putResponseToThread', 'putThreadToBoard'];
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
        var url = UtilLib.GetUrl(hostname, '/' + board_id + '/subject.txt');
        this.http.get(
          url,
          _(this.HTTP_REQ_HEADERS_DEFAULT)
          .extend({
            'Host': hostname,
          }))
          .done(function(http_response) {
            callback(this.parser.parseThreadList(UtilLib.ConvertToUTF8(http_response.body)));
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
        var url = UtilLib.GetUrl(hostname, '/' + board_id + '/SETTING.TXT');
        var http_request_headers = this.HTTP_REQ_HEADERS_DEFAULT;

        _(http_request_headers)
          .extend({
            'Host': hostname
          });

        this.http.get(url, http_request_headers)
          .done(function(http_response) {
            callback(this.parser.parseSettingText(UtilLib.ConvertToUTF8(http_response.body)));
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
        var url = UtilLib.GetUrl(hostname, '/' + board_id + UtilLib.GetDatPath(hostname, thread_id));
        this.http.get(
          url,
          _(this.HTTP_REQ_HEADERS_DEFAULT)
          .extend({
            'Host': hostname
          }))
          .done(function(http_response) {
            callback(this.parser.parseResponsesFromThread(UtilLib.ConvertToUTF8(http_response.body)));
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
        var args = Array.prototype.slice.call(arguments);

        var generate_http_params = function(callback) {
          // 書き込み内容などをSJISに変換する
          var converted_response = _.clone(this.response);
          _(converted_response)
            .each(function(value, key) {
              converted_response[key] = UtilLib.ConvertToSJIS(value);
            });

          // 書き込み内容などをパーセントエンコーディングでエスケープする
          var escaped_response = _.clone(converted_response)
          _(escaped_response)
            .each(function(value, key) {
              escaped_response[key] = UtilLib.EscapeSJIS(value);
            });

          // 送信するデータ
          _(this.http_req_params)
            .extend({
              'subject': '',
              'bbs': this.board_id,
              'key': this.thread_id,
              'time': 1,
              'submit': UtilLib.ConvertToSJIS('書き込む'),
              'FROM': escaped_response.name,
              'mail': escaped_response.mail,
              'MESSAGE': escaped_response.body,
            });

          callback();
        };

        args.unshift(generate_http_params);
        args.unshift(this.putResponseToThread);
        put_func.apply(this, args);
      }
    });

    /**
     * @description 書き込み完了後 callback(Object) として呼び出される
     * @callback Client#putResponseToThread-callback
     *
     * @param {Object} http_response
     * HTTPレスポンス
     */


    proto_extend({
      /**
       * @description スレッドを作成する
       * @memberof Client
       *
       * @param {String} hostname
       * ホスト名
       * @param {String} board_id
       * 板ID
       * @param {Object} response
       * スレッドの内容
       * @param {Client#putThreadToBoard-callback} callback
       * 書き込み完了後 callback(Object) として呼び出される
       */
      putThreadToBoard: function putThreadToBoard(hostname, board_id, response, ok_callback, fail_callback) {
        var args = Array.prototype.slice.call(arguments);

        var generate_http_params = function(callback) {
          // 書き込み内容などをSJISに変換する
          var converted_response = _.clone(this.response);
          _(converted_response)
            .each(function(value, key) {
              converted_response[key] = UtilLib.ConvertToSJIS(value);
            });

          // 書き込み内容などをパーセントエンコーディングでエスケープする
          var escaped_response = _.clone(converted_response)
          _(escaped_response)
            .each(function(value, key) {
              escaped_response[key] = UtilLib.EscapeSJIS(value);
            });

          // 送信するデータ
          _(this.http_req_params)
            .extend({
              'subject': escaped_response.subject,
              'bbs': this.board_id,
              'time': 1,
              'submit': UtilLib.ConvertToSJIS('スレッドを作成する'),
              'FROM': escaped_response.name,
              'mail': escaped_response.mail,
              'MESSAGE': escaped_response.body
            });

          callback();
        };

        args.unshift(generate_http_params);
        args.unshift(this.putThreadToBoard);
        put_func.call(
          this,
          this.putThreadToBoard,
          generate_http_params,
          hostname,
          board_id,
          '',
          response,
          ok_callback,
          fail_callback
        );
      }
    });

    /**
     * @description スレッド作成完了後 callback(Object) として呼び出される
     * @callback Client#putThreadToBoard-callback
     *
     * @param {Object} http_response
     * HTTPレスポンス
     */


    var put_func = function(self_func, generate_http_params_func, hostname, board_id, thread_id, response, ok_callback, fail_callback) {
      var put_utils = new PutUtils(this);

      put_utils.self_func = self_func;
      put_utils.url = UtilLib.GetUrl(hostname, '/test/bbs.cgi?guid=ON');
      put_utils.hostname = hostname;
      put_utils.board_id = board_id;
      put_utils.thread_id = thread_id;
      put_utils.response = response;
      put_utils.ok_callback = ok_callback;
      put_utils.fail_callback = fail_callback;

      put_utils.http_req_headers = _(this.HTTP_REQ_HEADERS_DEFAULT)
        .extend({
          'Host': hostname,
          'Referer': UtilLib.GetUrl(hostname, '/' + board_id + '/')
        });
      put_utils.http_req_params = {};

      put_utils.generate_http_params = generate_http_params_func;

      // リクエスト前の準備
      var deferreds = $.when.apply(null, [
        put_utils.prepare_cookie(),
        put_utils.prepare_http_req_params()
      ]);

      // 準備ができたらwriteを実行する
      deferreds.done(function() {
        put_utils.write();
      });
    };

    return Client;
  });

})();
