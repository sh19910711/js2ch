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
 * @fileOverview Chrome用ストレージ操作を行うライブラリ
 * @author Hiroyuki Sano
 */
(function() {
  'use strict';

  var root = this;

  define([
    'jquery',
    'underscore',
    'util'
  ], function($, _, util) {
    var storage = chrome.storage.local;

    /**
     * @constructor StorageChrome
     */
    var Storage = function() {};

    Storage.prototype = {};
    var proto = _(Storage.prototype);

    proto.extend({
      /**
       * @description 指定したキーを持つアイテムを取得する
       * @memberof StorageChrome
       *
       * @param {String|Array|Object} keys
       * 取得するアイテムのキー
       * @param {StorageChrome#get-callback} callback
       * アイテム取得後 callback(Object) として呼び出される
       */
      get: function get(keys, callback) {
        storage.get.apply(storage, arguments);
      }
    });

    /**
     * @description アイテム取得後 callback(Object) として呼び出される
     * @callback StorageChrome#get-callback
     *
     * @param {Object} items
     * 取得されたアイテム
     */

    proto.extend({
      /**
       * @description アイテムを設定する
       * @memberof StorageChrome
       *
       * @param {Object} items
       * ストレージに追加するアイテムの情報
       * @param {StorageChrome#set-callback} callback
       * アイテム設定後 callback() として呼び出される
       */
      set: function set(items, callback) {
        storage.set.apply(storage, arguments);
      }
    });

    /**
     * @description アイテム設定後 callback() として呼び出される
     * @callback StorageChrome#set-callback
     */

    proto.extend({
      /**
       * @description 指定したキーを持つアイテムを削除する
       * @memberof StorageChrome
       *
       * @param {String|Array} keys
       * 削除するアイテムのキー
       * @param {StorageChrome#remove-callback} callback
       * アイテム削除後 callback() として呼び出される
       */
      remove: function remove(keys, callback) {
        storage.remove.apply(storage, arguments);
      }
    });

    /**
     * @description アイテム削除後 callback() として呼び出される
     * @callback StorageChrome#remove-callback
     */

    proto.extend({
      /**
       * @description すべてのデータを削除する
       * @memberof StorageChrome
       *
       * @param {StorageChrome#clear-callback} callback
       * 削除後 callback() として呼び出される
       */
      clear: function clear(callback) {
        storage.clear.apply(storage, arguments);
      }
    });

    /**
     * @description 削除完了後 callback() として呼び出される
     * @callback StorageChrome#clear-callback
     */

    // Deferred設定
    var keys = ["get", "set", "remove", "clear"];
    _(keys)
      .each(function(key) {
        Storage.prototype[key] = util.getDeferredFunc(Storage.prototype[key]);
      });

    return new Storage();
  });

})
  .call(this);
