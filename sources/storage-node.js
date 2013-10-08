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
 * @fileOverview Node.js用のストレージ操作用ライブラリ
 * @author Hiroyuki Sano
 */
(function() {
  'use strict';

  var root = this;

  define([
    'underscore',
    'jquery',
    'util-lib',
    'sqlite3'
  ], function(_, $, UtilLib, sqlite3) {
    // on memory (test)
    var TABLE_NAME = 'items';
    var STORAGE_TARGET = 'js2ch.db';

    /**
     * @constructor StorageNode
     */
    var StorageNode = function(options, callback_context) {
      callback_context = callback_context || this;
      options = (options && options['storage']) || options || {};

      var self = this;
      self.callbacks = new $.Callbacks('once');
      self.target = (options && options.target) || STORAGE_TARGET;

      // テーブルを作成する
      // （作成が済むまで他の操作はcallbacksにストックしておく）
      this.sqlite = sqlite3.verbose();
      var db = new this.sqlite.Database(self.target);
      db.serialize(function() {
        db.get('SELECT COUNT(*) FROM sqlite_master WHERE type=\'table\' and name=\'' + TABLE_NAME + '\'', function(error, row) {
          var result = row['COUNT(*)'];
          if (result === 0) {
            db.run('CREATE TABLE ' + TABLE_NAME + ' (key, value)', function() {
              self.callbacks.fire();
              db.close();
            });
          }
          else {
            self.callbacks.fire();
          }
        });
      });

      // Deferred設定
      var keys = ["get", "set", "remove", "clear"];
      _(keys)
        .each(function(key) {
          this[key] = UtilLib.getDeferredFunc(this[key], this, callback_context);
        }, this);

    };

    StorageNode.prototype = {};
    var proto_extend = function(obj) {
      _.extend(StorageNode.prototype, obj);
    };

    proto_extend({
      /**
       * @description 指定したキーを持つアイテムを取得する
       * @memberof StorageNode
       *
       * @param {String|Array|Object} keys
       * 取得するアイテムのキー
       * @param {StorageNode#get-callback} callback
       * アイテム取得後 callback(Object) として呼び出される
       */
      get: function get(keys, callback) {
        if (!this.callbacks.fired()) {
          // 初期化処理を済ませてから実行する
          this.callbacks.add(get.bind(this, keys, callback));
          return;
        }

        var default_values = {};
        var hash_table = {};

        // keysは文字列か配列かオブジェクト
        if (typeof keys === 'string') {
          keys = [keys];
          _(keys)
            .each(function(key) {
              default_values[key] = undefined;
            });
        }
        else if (Array.isArray(keys)) {
          _(keys)
            .each(function(key) {
              default_values[key] = undefined;
            })
        }
        else if (typeof keys === 'object') {
          default_values = _(keys)
            .clone();
          keys = _.keys(keys);
        }

        // ハッシュテーブルに登録しておく
        _(keys)
          .each(function(key) {
            hash_table[key] = 0;
          });

        // アイテムを取得する
        var db = new this.sqlite.Database(this.target);
        db.all('SELECT key,value FROM ' + TABLE_NAME, function(error, rows) {
          var res = _(default_values)
            .clone();
          var filtered = _(rows)
            .filter(function(item) {
              return typeof hash_table[item.key] !== 'undefined';
            });
          _(filtered)
            .each(function(item) {
              res[item.key] = JSON.parse(item.value);
            });
          db.close();
          callback(res);
        });
      }
    });

    /**
     * @description アイテム取得後 callback(Object) として呼び出される
     * @callback StorageNode#get-callback
     *
     * @param {Object} items
     * 取得されたアイテム
     */

    proto_extend({
      /**
       * @description アイテムを設定する
       * @memberof StorageNode
       *
       * @param {Object} items
       * ストレージに追加するアイテムの情報
       * @param {StorageNode#set-callback} callback
       * アイテム設定後 callback() として呼び出される
       */
      set: function set(items, callback) {
        if (!this.callbacks.fired()) {
          this.callbacks.add(set.bind(this, items, callback));
          return;
        }

        // 値を文字列に変換しておく
        var serialized = {};
        var keys = _.keys(items);
        _(keys)
          .each(function(key) {
            serialized[key] = JSON.stringify(items[key]);
          });

        var db = new this.sqlite.Database(this.target);
        db.serialize(function() {
          var deferreds = [];
          // UPDATE
          (function() {
            var deferred = new $.Deferred();
            var stmt = db.prepare('UPDATE ' + TABLE_NAME + ' SET value = ? WHERE key = ?');
            _(serialized)
              .each(function(value, key) {
                stmt.run(value, key, function() {
                  deferred.resolve();
                });
              });
            stmt.finalize();
            deferreds.push(deferred);
          })();

          // 存在しないキーはINSERT
          (function() {
            _(serialized)
              .each(function(value, key) {
                var deferred = new $.Deferred();
                db.get('SELECT * FROM ' + TABLE_NAME + ' WHERE key = ' + key, function(error, row) {
                  var stmt = db.prepare('INSERT INTO ' + TABLE_NAME + ' VALUES(?,?)');
                  stmt.run(key, value, function() {
                    stmt.finalize();
                    deferred.resolve();
                  });
                });
                deferreds.push(deferred);
              });
          })();

          $.when.apply(null, deferreds)
            .done(function() {
              db.close();
              callback();
            });
        });

      }
    });

    /**
     * @description アイテム設定後 callback() として呼び出される
     * @callback StorageNode#set-callback
     */

    proto_extend({
      /**
       * @description 指定したデータを削除する
       * @memberof StorageNode
       *
       * @param {StorageNode#remove-callback} callback
       * 削除後 callback() として呼び出される
       */
      remove: function remove(keys, callback) {
        if (!this.callbacks.fired()) {
          this.callbacks.add(remove.bind(this, keys, callback));
          return;
        }

        if (typeof keys === 'string')
          keys = [keys];

        // アイテムを削除する
        var db = new this.sqlite.Database(this.target);
        var stmt = db.prepare('DELETE FROM ' + TABLE_NAME + ' WHERE key = ?');
        var deferreds = [];
        _(keys)
          .each(function(key) {
            var deferred = new $.Deferred();
            stmt.run(key, function(error, row) {
              deferred.resolve();
            });
            deferreds.push(deferred);
          });
        $.when.apply(null, deferreds)
          .done(function() {
            stmt.finalize();
            db.close();
            callback();
          });
      }
    });

    /**
     * @description アイテム削除後 callback() として呼び出される
     * @callback StorageNode#remove-callback
     */

    proto_extend({
      /**
       * @description すべてのデータを削除する
       * @memberof StorageNode
       *
       * @param {StorageNode#clear-callback} callback
       * 削除後 callback() として呼び出される
       */
      clear: function clear(callback) {
        if (!this.callbacks.fired()) {
          this.callbacks.add(clear.bind(this, callback));
          return;
        }

        // アイテムを削除する
        var db = new this.sqlite.Database(this.target);
        db.run('DELETE FROM ' + TABLE_NAME, function() {
          db.close();
          callback();
        });
      }
    });

    /**
     * @description 削除完了後 callback() として呼び出される
     * @callback StorageNode#clear-callback
     */

    return StorageNode;
  });

})();
