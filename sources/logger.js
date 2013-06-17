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
    'formatter'
  ], function(_, formatter) {
    var Logger = function() {};

    Logger.prototype = {};
    var proto = _(Logger.prototype);

    proto.extend({
      // ログ出力
      log: function log() {
        console.log.apply(console, arguments);
      }
    });

    proto.extend({
      // デバッグ出力
      debug: function debug() {
        console.debug.apply(console, arguments);
      }
    });

    proto.extend({
      // 情報出力
      info: function info() {
        console.info.apply(console, arguments);
      }
    });

    proto.extend({
      // 警告を出力
      warn: function warn() {
        console.warn.apply(console, arguments);
      }
    });

    proto.extend({
      // エラー出力
      error: function error() {
        console.error.apply(console, arguments);
      }
    });


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

    return new Logger();
  });

})
  .call(this);
