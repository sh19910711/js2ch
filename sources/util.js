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
 * @fileOverview ユーティリティライブラリ
 * @author Hiroyuki Sano
 */
(function() {
  'use strict'

  define([
    'jquery',
    'underscore'
  ], function($, _) {
    /**
     * @constructor Util
     */
    var Util = function() {};

    Util.prototype = {};
    var proto = _(Util.prototype);

    proto.extend({
      /**
       * @description
       * 与えられた関数をDeferredを返すように変更した関数を返す
       * @memberof Util
       *
       * @param {Function} func
       * 変更する関数
       * @return {Function}
       */
      getDeferredFunc: function getDeferredFunc(func) {
        return function() {
          var self = this;
          var deferred = new $.Deferred();
          var callback = arguments[arguments.length - 1];
          var args = Array.prototype.slice.apply(arguments);
          setTimeout(function() {
            if (callback instanceof Function) {
              args[args.length - 1] = function() {
                if (callback instanceof Function)
                  callback.apply(this, arguments);
                deferred.resolve.apply(this, arguments);
              };
            }
            else {
              args.push(function() {
                if (callback instanceof Function)
                  callback.apply(this, arguments);
                deferred.resolve.apply(this, arguments);
              });
            }
            func.apply(self, args);
          }, 0);
          return deferred;
        };
      }
    });

    proto.extend({
      /**
       * @description 与えられた文字列をtokenで分割する
       * @memberof Util
       *
       * @param {String} str
       * 分割する文字列
       * @param {String} token
       * 分割用のトークン
       * @return {Array}
       */
      splitString: function splitString(str, token) {
        var x = str.indexOf(token);
        return [str.substring(0, x), str.substring(x + token.length)];
      }
    });

    proto.extend({
      /**
       * @description 文字列が空かどうかを調べる
       * @memberof Util
       *
       * @param {String} str
       * 空かどうかを調べる文字列
       * @return {Boolean}
       */
      checkEmptyString: function checkEmptyString(str) {
        return $.trim(str)
          .length === 0;
      }
    });

    return new Util();
  });

})
  .call(this);
