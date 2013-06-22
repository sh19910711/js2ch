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
    'storage'
  ], function(_, $, Storage) {

    /**
     * @constructor CookieManager
     */
    var CookieManager = function() {
      this.storage = new Storage();
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
        var promise = this.storage.clear();
        promise.done(callback);
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
      getCookieHeader: function getCookieHeader(url, callback) {}
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
       * @param {Object} cookies
       * 保存するCookieの情報
       * @param {CookieManager#set-callback} callback
       * 保存完了後、callback() として呼び出される
       */
      set: function set(cookies, callback) {
        _(cookies)
          .each(function() {});
      }
    });

    /**
     * @description 保存完了後、callback() として呼び出される
     * @callback CookieManager#set-callback
     */

    return CookieManager;
  });

})();
