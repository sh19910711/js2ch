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

  define([], function() {
    // 各種データの構文解析用ライブラリ
    var Parser = function() {
    };

    Parser.prototype = {};
    var proto = _(Parser.prototype);

    proto.extend({
      // SUBJECT.TXTのデータをオブジェクトに変換する
      parseSubjectText: function parseSubjectText(str) {
      }
    });

    proto.extend({
      // スレッドの書き込み一覧をオブジェクトの配列に変換する
      parseThreadList: function parseThreadList(str) {
      }
    });

    return new Parser();
  });

}).call(this);
