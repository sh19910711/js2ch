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
    'parser',
    'encoding',
    'util',
    'logger'
  ], function($, _, Backbone, http, storage, parser, encoding, util, logger) {

    /**
     * @constructor Client
     */
    var Client = function() {
      /**
       * @description HTTPリクエスト時に渡すヘッダのリスト
       * @memberof Client
       *
       */
      this.HTTP_REQ_HEADERS_DEFAULT = {
        'User-Agent': 'Monazilla/1.00'
      };
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
        http.get(
          url,
          _(this.HTTP_REQ_HEADERS_DEFAULT)
          .extend({
            'Host': hostname,
          }))
          .done(function(http_response) {
            callback(parser.parseThreadList(http_response.body));
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
        http.get(
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
        http.get(
          url,
          _(this.HTTP_REQ_HEADERS_DEFAULT)
          .extend({
            'Host': hostname
          }))
          .done(function(http_response) {
            callback(parser.parseResponsesFromThread(http_response.body));
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
      putResponseToThread: function putResponseToThread(hostname, board_id, thread_id, response, callback) {
        var url = GetUrl(hostname, '/test/bbs.cgi?guid=ON');

        var http_req_headers = _(this.HTTP_REQ_HEADERS_DEFAULT)
          .extend({
            'Host': hostname,
            'Referer': GetUrl(hostname, '/' + board_id + '/')
          });

        // 書き込みを行う

        function Write(callback) {

          // 書き込み送信後にHTTPレスポンスヘッダを受け取る
          function RecieveResponse(http_response) {
            var deferreds = [];

            // HTTPレスポンスヘッダにSet-Cookieがある場合の処理
            if (typeof http_response.headers['Set-Cookie'] !== 'undefined')
              deferreds.push(RecieveCookies(http_response.headers['Set-Cookie']));

            // 各処理が終わったらputResponseToThreadとしての結果を返す
            $.when.apply(null, deferreds)
              .done(function() {
                callback(http_response);
              });
          }

          // HTTPレスポンスヘッダからCookieを取り出す

          function RecieveCookies(set_cookies, callback) {

            // Set-Cookieヘッダを解析する
            function ParseSetCookie() {
              // 分割する
              _(set_cookies.split(';'))
                .each(function(set_cookie) {
                  var list = util.splitString(set_cookie, '=');
                  var key = $.trim(list[0]);
                  var value = $.trim(list[1]);

                  if (key === 'expires' || key === 'path')
                    return;

                  var obj = {};
                  obj[key] = value;
                  _(cookies)
                    .extend(obj);
                });

              // 忍法帖用のCookieを持っていなかったら作成する
              if (typeof cookies['HAP'] === 'undefined')
                cookies['HAP'] = '';

              // Cookieを保存する
              return storage.set({
                'cookies': cookies
              });
            }

            var cookies = {};

            if (Array.isArray(set_cookies))
              return $.when.apply(null, _(set_cookies)
                .map(RecieveCookies));

            return $.when.apply(null, [
              storage.get('cookies')
              .done(function(items) {
                // 保存済みのCookieを取得する
                _(cookies)
                  .extend(items.cookies);
              })
            ])
              .done(ParseSetCookie);
          }

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
          http.post(
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
            .done(RecieveResponse);
        }

        // CookieのHTTPリクエストヘッダを取得する

        function GetCookieHeader(cookies) {
          var keys = _.keys(cookies);
          var cookies_header_terms = _(keys)
            .map(function(key) {
              return key + '=' + cookies[key];
            });
          return cookies_header_terms.join('; ');
        }


        $.when.apply(null, [
          storage.get('cookies')
          .done(function(items) {
            if (typeof items.cookies !== 'undefined') {
              _(http_req_headers)
                .extend({
                  'Cookie': GetCookieHeader(items.cookies)
                });
            }
          })
        ])
          .done(function() {
            Write(callback);
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


    // Deferredの設定
    var keys = ['getThreadList', 'getSettingText', 'getResponsesFromThread', 'putResponseToThread'];
    _(keys)
      .each(function(key) {
        Client.prototype[key] = util.getDeferredFunc(Client.prototype[key]);
      });

    return new Client();
  });

})
  .call(this);
