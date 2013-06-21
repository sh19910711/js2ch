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
 * @fileOverview 与えられたオブジェクトを何らかの形に整えるライブラリ
 * @author Hiroyuki Sano
 */
(function() {
  define([
    'underscore'
  ], function(_) {
    /**
     * @constructor Formatter
     */
    var Formatter = function() {};

    Formatter.prototype = {};
    var proto = _(Formatter.prototype);

    proto.extend({
      /**
       * @description [未実装] 与えられたオブジェクトを何らかの形に整える（デバッグ出力などで利用）
       * @memberof Formatter
       *
       * @param {Object} obj
       * 変換したいオブジェクト
       * @return {Object}
       * 何らかの形式に変換されたオブジェクト
       */
      format: function format(obj) {
        // TODO: 種類に合わせて分岐、普通のオブジェクトのときはそのまま返す
        return obj;
      }
    });

    return Formatter;
  });
})();
