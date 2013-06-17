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
  define([
      'underscore'
    ], function(_) {
      var Formatter = function() {};

      Formatter.prototype = {};
      var proto = _(Formatter.prototype);

      proto.extend({
          // 与えられたオブジェクトを何らかの形に整える（デバッグ出力などで利用）
          format: function format(obj) {
            // TODO: 種類に合わせて分岐、普通のオブジェクトのときはそのまま返す
            return obj;
          }
        });

      return new Formatter();
    });
}).call(this);
