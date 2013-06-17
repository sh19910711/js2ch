/* ===================================================
 * JavaScript 2ch-client Library
 * https://github.com/sh19910711/js2ch
 * ===================================================
 * Copyright (c) 2013 Hiroyuki Sano
 *
 * Licensed under MIT License.
 * http://opensource.org/licenses/MIT
 * =================================================== */
(function() {
  'use strict';

  var root = this;

  define([
    'jquery',
    'underscore',
    'util'
  ], function($, _, util) {
    var storage = chrome.storage.local;

    var Storage = function() {};

    Storage.prototype = {};
    var proto = _(Storage.prototype);

    proto.extend({
      // 指定したキーを持つアイテムを取得する
      get: function get(keys, callback) {
        storage.get.apply(storage, arguments);
      }
    });

    proto.extend({
      // アイテムを設定する
      set: function set(items, callback) {
        storage.set.apply(storage, arguments);
      }
    });

    proto.extend({
      // 指定したキーを持つアイテムを削除する
      remove: function remove(keys, callback) {
        storage.remove.apply(storage, arguments);
      }
    });

    proto.extend({
      // すべてのデータを削除する
      clear: function clear(callback) {
        storage.clear.apply(storage, arguments);
      }
    });

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
