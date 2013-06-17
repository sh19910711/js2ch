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
    'underscore'
  ], function(_) {
    var Logger = function() {
    };

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
      error: function error() {
        console.error.apply(console, arguments);
      }
    });

    return new Logger();
  });

}).call(this);
