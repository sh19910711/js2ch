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
 * @fileOverview Cookie操作用のライブラリ
 * @author Hiroyuki Sano
 */
(function() {
  'use strict';

  define([
    'underscore',
    'jquery',
    'storage',
    'util-lib',
    'purl'
  ], function(_, $, Storage, UtilLib, purl_dummy) {

    /**
     * @constructor CookieManager
     */
    var CookieManager = function(options) {
      this.storage = new Storage((options && options.storage) || {});
    };

    CookieManager.prototype = {};
    var proto = _(CookieManager.prototype);

    proto.extend({
      /**
       * @description 記録しているCookieを全消去する
       * @memberof CookieManager
       *
       * @param {CookieManager#clear-callback} callback
       */
      clear: function clear(callback) {
        this.storage.clear(function() {
          callback();
        });
      }
    });

    /**
     * @description 消去完了後, callback() として呼び出される
     * @callback CookieManager#clear-callback
     */


    proto.extend({
      /**
       * @description 与えられたURLに対するCookieヘッダを返す
       * @memberof CookieManager
       *
       * @param {String} url
       * Cookieヘッダを取り出すURL
       * @param {CookieManager#getCookieHeader-callback} callback
       *
       */
      getCookieHeader: function getCookieHeader(url, callback) {
        var url_obj = $.url(url);
        var host = url_obj.attr('host');
        var port = url_obj.attr('port') || 80;
        var path = url_obj.attr('path') || '/';

        if (!/\/$/.test(path))
          path += '/';

        this.storage.get('cookies')
          .done(function(items) {
            // 取得したCookieを取捨選別する
            var cookies = _(items.cookies)
              .filter(function(cookie_obj) {
                // ドメイン名にマッチするCookieを残す
                var regexp = new RegExp(cookie_obj.domain + '$', 'i');
                return regexp.test(host);
              })
              .filter(function(cookie_obj) {
                // パスにマッチするCookieを残す
                var regexp = new RegExp('^' + cookie_obj.path);
                return regexp.test(path);
              });

            // ヘッダ用の文字列に変換する
            var http_header_text = _(cookies)
              .map(function(cookie) {
                return cookie.key + '=' + cookie.value
              })
              .join('; ');

            callback('Cookie: ' + http_header_text);
          });
      }
    });

    /**
     * @description 取得完了後、callback(cookie_header) として呼び出される
     * @callback CookieManager#getCookieHeader-callback
     *
     * @param {String} cookie_header
     */


    proto.extend({
      /**
       * @description 指定したCookieを保存する
       * @memberof CookieManager
       *
       * @param {String} url
       * 保存元のURL
       * @param {Object} cookies
       * 保存するCookieの情報
       * @param {CookieManager#set-callback} callback
       * 保存完了後、callback() として呼び出される
       */
      set: function set(url, cookies, callback) {
        // ストレージに保存する
        this.storage.get('cookies')
          .done(function(items) {
            if (!Array.isArray(items.cookies))
              items.cookies = [];
            items.cookies = items.cookies.concat(cookies);
            var promise = this.storage.set({
              'cookies': items.cookies
            });
            promise.done(callback);
          }.bind(this));
      }
    });

    /**
     * @description 保存完了後、callback() として呼び出される
     * @callback CookieManager#set-callback
     */


    proto.extend({
      /**
       * @description HTTPレスポンスヘッダを渡すとSet-Cookieを解析して保存する
       * @memberof CookieManager
       *
       * @param {String} url
       * 保存元のURL
       * @param {String} http_response_headers
       * 保存するCookieの情報
       * @param {CookieManager#setCookieHeader-callback} callback
       * 保存完了後、callback() として呼び出される
       */
      setCookieHeader: function setCookieHeader(url, http_response_headers, callback) {

        // Set-Cookieヘッダを取り出す
        var cookies = _(http_response_headers.split('\r\n'))
          .filter(function(line) {
            return /^set-cookie\:/i.test(line);
          })
          .map(function(line) {
            line = line.substr(11);

            // ';'（セミコロン）で区切る
            var split_list = _(line.split(';'))
              .map($.trim);

            // split_listから先頭の要素を取り出す
            var cookie_pair = UtilLib.splitString(split_list.splice(0, 1)[0], '=');
            var cookie_obj = {
              key: cookie_pair[0],
              value: cookie_pair[1]
            };

            // Cookieの属性情報を取得する
            var attributes = _(split_list)
              .reduce(function(obj_sum, line) {
                var split_list = UtilLib.splitString(line, '=');
                var attribute_name = split_list[0];
                var attribute_value = split_list[1];
                var obj = {};

                // expire: 寿命
                if (/^expires$/i.test(attribute_name)) {
                  obj['expires'] = attribute_value;
                }

                // path: 有効なパス
                else if (/^path$/i.test(attribute_name)) {
                  obj['path'] = attribute_value;
                }

                _(obj_sum)
                  .extend(obj);

                return obj_sum;
              }, {});

            var url_obj = $.url(url);
            var host = url_obj.attr('host');
            var port = url_obj.attr('port') || 80;
            var path = url_obj.attr('path') || '/';

            if (typeof attributes.domain === 'undefined')
              attributes.domain = host;

            if (typeof attributes.path === 'undefined')
              attributes.path = path;

            if (!/\/$/.test(attributes.path))
              attributes.path += '/';

            _(cookie_obj)
              .extend(attributes);

            return cookie_obj;
          });

        this.set(url, cookies)
          .done(callback);
      }
    });

    /**
     * @description 保存完了後、callback() として呼び出される
     * @callback CookieManager#set-callback
     */


    // Deferred設定
    var keys = ['clear', 'getCookieHeader', 'setCookieHeader', 'set'];
    _(keys)
      .each(function(key) {
        CookieManager.prototype[key] = UtilLib.getDeferredFunc(CookieManager.prototype[key]);
      });

    return CookieManager;
  });

})();
