(function() {
  'use strict';

  var root = this;

  define([
    'underscore',
    'util',
    'sqlite3'
  ], function(_, util, sqlite3) {
    // on memory (test)
    var sqlite = sqlite3.verbose();
    var database = new sqlite.Database(':memory:');

    // ストレージ操作用のクラス
    var Storage = function() {
    };

    Storage.prototype = {};
    var proto = _(Storage.prototype);

    proto.extend({
      // 与えられたキーに紐付けられたデータを取得する
      get: function get(keys, callback) {
        // TODO: 実装
      }
    });

    proto.extend({
      // 与えたデータを保存する
      set: function set(items, callback) {
        // TODO: 実装
      }
    });

    proto.extend({
      // 与えられたキーに紐付けられたデータを削除する
      remove: function remove(keys, callback) {
        // TODO: 実装
      }
    });

    proto.extend({
      // すべてのデータを削除する
      clear: function clear(callback) {
        // TODO: 実装
      }
    });

    // Deferredの設定
    var keys = ['get', 'set', 'remove', 'clear'];
    _(keys).each(function(key) {
      Storage.prototype[key] = util.getDeferredFunc(Storage.prototype[key]);
    });

    return new Storage();
  });

}).call(this);
