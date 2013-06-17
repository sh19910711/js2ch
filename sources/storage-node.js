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
    'underscore',
    'jquery',
    'util',
    'sqlite3'
  ], function(_, $, util, sqlite3) {
    // on memory (test)
    var sqlite = sqlite3.verbose();
    var TABLE_NAME = 'items';
    var STORAGE_TARGET = 'js2ch.db';
    var callbacks = new $.Callbacks('once');
    var fired = false;

    // ストレージ操作用のクラス
    var Storage = function() {
      // テーブルを作成する
      // （作成が済むまで他の操作はcallbacksにストックしておく）
      var db = new sqlite.Database(STORAGE_TARGET);
      db.get('SELECT COUNT(*) FROM sqlite_master WHERE type=\'table\' and name=\'' + TABLE_NAME + '\'', function(error, row) {
        var result = row['COUNT(*)'];
        if (result === 0) {
          db.run('CREATE TABLE ' + TABLE_NAME + ' (key, value)', function() {
            callbacks.fire();
            db.close();
          });
        }
        else {
          callbacks.fire();
        }
      });
    };

    Storage.prototype = {};
    var proto = _(Storage.prototype);

    proto.extend({
      // 与えられたキーに紐付けられたデータを取得する
      get: function get(keys, callback) {
        if (!callbacks.fired()) {
          callbacks.add(get.bind(this, keys, callback));
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
        var db = new sqlite.Database(STORAGE_TARGET);
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

    proto.extend({
      // 与えたデータを保存する
      set: function set(items, callback) {
        if (!callbacks.fired()) {
          callbacks.add(set.bind(this, items, callback));
          return;
        }

        // 値を文字列に変換しておく
        var serialized = {};
        var keys = _.keys(items);
        _(keys)
          .each(function(key) {
            serialized[key] = JSON.stringify(items[key]);
          });

        var db = new sqlite.Database(STORAGE_TARGET);
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

    proto.extend({
      // 与えられたキーに紐付けられたデータを削除する
      remove: function remove(keys, callback) {
        if (!callbacks.fired()) {
          callbacks.add(remove.bind(this, keys, callback));
          return;
        }

        if (typeof keys === 'string')
          keys = [keys];

        // アイテムを削除する
        var db = new sqlite.Database(STORAGE_TARGET);
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

    proto.extend({
      // すべてのデータを削除する
      clear: function clear(callback) {
        if (!callbacks.fired()) {
          callbacks.add(clear.bind(this, callback));
          return;
        }

        // アイテムを削除する
        var db = new sqlite.Database(STORAGE_TARGET);
        db.run('DELETE FROM ' + TABLE_NAME, function() {
          db.close();
          callback();
        });
      }
    });

    // Deferredの設定
    var keys = ['get', 'set', 'remove', 'clear'];
    _(keys)
      .each(function(key) {
        Storage.prototype[key] = util.getDeferredFunc(Storage.prototype[key]);
      });

    return new Storage();
  });

})
  .call(this);
