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
    'underscore',
    'encoding'
  ], function($, _, encoding) {
    /**
     * @constructor UtilLib
     */
    var UtilLib = function() {};

    var _util_lib_extend = function(obj) {
      _.extend(UtilLib, obj);
    };

    _util_lib_extend({
      /**
       * @description
       * 与えられた関数をDeferredを返すように変更した関数を返す
       * @memberof UtilLib
       *
       * @param {Function} func
       * 変更する関数
       * @param {Function} inner_context
       * funcのcontext
       * @param {Function} callback_context
       * callback関数のcontext
       * @return {Function}
       */
      getDeferredFunc: function getDeferredFunc(func, inner_context, callback_context) {
        return function() {
          inner_context = this || inner_context;
          callback_context = callback_context || inner_context;

          var deferred = new $.Deferred();
          var callback = arguments[arguments.length - 1];
          var args = Array.prototype.slice.apply(arguments);

          // callback関数とpromise#done関数を呼び出すための関数を
          // 元の関数のcallbackに登録する
          if (callback instanceof Function) {
            args[args.length - 1] = function() {
              if (callback instanceof Function)
                callback.apply(callback_context, arguments);
              deferred.resolveWith(callback_context, arguments);
            };
          }
          else {
            args.push(function() {
              if (callback instanceof Function)
                callback.apply(callback_context, arguments);
              deferred.resolveWith(callback_context, arguments);
            });
          }

          // Deferredする前の関数を呼び出す
          func.apply(inner_context, args);

          return deferred;
        };
      }
    });

    _util_lib_extend({
      /**
       * @description
       * 与えられた関数をDeferredを返すように変更した関数を返す
       * @memberof UtilLib
       *
       * @param {Function} func
       * 変更する関数
       * @param {Function} inner_context
       * funcのcontext
       * @param {Function} callback_context
       * callback関数のcontext
       * @return {Function}
       */
      getDeferredFuncWillFail: function getDeferredFuncWillFail(func, inner_context, callback_context) {
        return function() {
          inner_context = this || inner_context;
          callback_context = callback_context || inner_context;

          var deferred = new $.Deferred();

          // argumentsを配列に変換する
          var args = Array.prototype.slice.apply(arguments);

          var done_callback = function() {}, fail_callback = function() {};

          if ((args[args.length - 2] instanceof Function) && (args[args.length - 1] instanceof Function)) {
            done_callback = arguments[arguments.length - 2];
            fail_callback = arguments[arguments.length - 1];

            // done_callback関数とpromise#done関数を呼び出すための関数を
            // 元の関数のdone_callbackに登録する
            args[args.length - 2] = function() {
              if (done_callback instanceof Function)
                done_callback.apply(callback_context, arguments);
              deferred.resolveWith(callback_context, arguments);
            };

            // fail_callback関数とpromise#done関数を呼び出すための関数を
            // 元の関数のcallbackに登録する
            args[args.length - 1] = function() {
              if (fail_callback instanceof Function)
                fail_callback.apply(callback_context, arguments);
              deferred.rejectWith(callback_context, arguments);
            };
          }
          else if (args[args.length - 1] instanceof Function) {
            done_callback = arguments[arguments.length - 1];

            // done_callback関数とpromise#done関数を呼び出すための関数を
            // 元の関数のdone_callbackに登録する
            args[args.length - 1] = function() {
              if (done_callback instanceof Function)
                done_callback.apply(callback_context, arguments);
              deferred.resolveWith(callback_context, arguments);
            };

            args.push(function() {
              deferred.rejectWith(callback_context, arguments);
            });
          }
          else {
            args.push(function() {
              deferred.resolveWith(callback_context, arguments);
            });
            args.push(function() {
              deferred.rejectWith(callback_context, arguments);
            });
          }


          // Deferredする前の関数を呼び出す
          func.apply(inner_context, args);

          return deferred;
        };
      }
    });

    _util_lib_extend({
      /**
       * @description 与えられた文字列をtokenで分割する
       * @memberof UtilLib
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

    _util_lib_extend({
      /**
       * @description 文字列が空かどうかを調べる
       * @memberof UtilLib
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

    //
    // TODO: リファクタリング
    // 

    // ホスト名とパスを繋げたURLを返す
    UtilLib.GetUrl = function(hostname, path) {
      return 'http://' + hostname + path;
    };

    // DATファイルのパスを返す
    UtilLib.GetDatPath = function(hostname, thread_id) {
      return '/dat/' + thread_id + '.dat';
    };

    // 与えられた文字列をSJISに変換する
    UtilLib.ConvertToSJIS = function(str) {
      return encoding.codeToString(encoding.convert(UtilLib.GetArray(str), 'SJIS', 'AUTO'));
    };

    // 与えられた文字列をUTF-8に変換する

    UtilLib.ConvertToUTF8 = function(str) {
      return encoding.codeToString(encoding.convert(UtilLib.GetArray(str), 'UNICODE', 'AUTO'));
    };

    // 与えられた文字列をSJISに変換する
    UtilLib.EscapeSJIS = function(str) {
      return _(str)
        .map(function(c) {
          var code = c.charCodeAt()
            .toString(16)
            .toUpperCase();
          while (code.length < 2)
            code = "0" + code;
          return '%' + code;
        })
        .join('');
    };

    // 文字列を配列に変換する
    UtilLib.GetArray = function(str) {
      var res = [];
      _(str.split(''))
        .each(function(c) {
          res.push(c.charCodeAt());
        });
      return res;
    };

    return UtilLib;
  });

})();
