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
 * @fileOverview ログ管理用ライブラリ
 * @author Hiroyuki Sano
 */
(function() {
  'use strict';

  var root = this;

  define([
    'underscore',
    'formatter'
  ], function(_, formatter) {
    /**
     * @constructor Logger
     */
    var Logger = function() {};

    Logger.prototype = {};
    var proto_extend = function(obj) {
      _.extend(Logger.prototype, obj);
    };

    proto_extend({
      /**
       * @description ログ出力を行う
       * @memberof Logger
       */
      log: function log() {
        console.log.apply(console, arguments);
      }
    });

    proto_extend({
      /**
       * @description デバッグ出力を行う
       * @memberof Logger
       */
      debug: function debug() {
        console.debug.apply(console, arguments);
      }
    });

    proto_extend({
      /**
       * @description 情報を出力する
       * @memberof Logger
       */
      info: function info() {
        console.info.apply(console, arguments);
      }
    });

    proto_extend({
      /**
       * @description 警告を出力する
       * @memberof Logger
       */
      warn: function warn() {
        console.warn.apply(console, arguments);
      }
    });

    proto_extend({
      /**
       * @description エラー出力を行う
       * @memberof Logger
       */
      error: function error() {
        console.error.apply(console, arguments);
      }
    });


    // 各出力の前にFormatter#formatを行いデータを整える
    var keys = ['log', 'debug', 'info', 'warn', 'error'];
    _(keys)
      .each(function(key) {
        var func = Logger.prototype[key];
        Logger.prototype[key] = function() {
          var args = Array.prototype.slice.apply(arguments);
          args = _(args)
            .map(function(arg) {
              return formatter.format(arg);
            });
          func.apply(this, args);
        };
      });

    return Logger;
  });

})();
