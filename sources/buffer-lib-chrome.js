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
 * @fileOverview Chrome用のバッファ操作ライブラリ
 * @author Hiroyuki Sano
 **/
(function() {
  'use strict';

  define([
    'underscore',
    'encoding',
    'logger',
    'util-lib'
  ], function(_, encoding, logger, UtilLib) {
    /**
     * @constructor BufferLibChrome
     */
    var BufferLibChrome = function(options, callback_context) {
      callback_context = callback_context || this;
      options = (options && options['buffer-lib']) || options || {};

      // Deferredの設定
      var keys = ['convertToString', 'convertToBuffer', 'getByteLength'];
      _(keys)
        .each(function(key) {
          this[key] = UtilLib.getDeferredFunc(this[key], this, callback_context);
        }, this);
    };

    BufferLibChrome.prototype = {};
    var proto_extend = function(obj) {
      _.extend(BufferLibChrome.prototype, obj);
    };

    proto_extend({
      /**
       * @description ArrayBufferを文字列に変換する
       * @memberof BufferLibChrome
       *
       * @param {ArrayBuffer} buf_array
       * 文字列に変換するArrayBuffer
       * @param {Function} callback
       * コールバック関数。処理完了後 callback(String) として呼び出される。
       */
      convertToString: function convertToString(buf_array, callback) {
        var fileReader = new FileReader();
        fileReader.onloadend = function() {
          callback(fileReader.result);
        };
        fileReader.readAsText(new Blob([new Uint8Array(buf_array)]), 'sjis');
      }
    });

    proto_extend({
      /**
       * @description 文字列をArrayBufferに変換する
       * @memberof BufferLibChrome
       *
       * @param {String} str
       * ArrayBufferに変換する文字列
       * @param {Function} callback
       * 処理完了後 callback(ArrayBuffer) として呼び出される。
       */
      convertToBuffer: function convertToBuffer(str, callback) {
        var fileReader = new FileReader();
        fileReader.onloadend = function() {
          callback(fileReader.result);
        };
        fileReader.readAsArrayBuffer(new Blob([str]));
      }
    });

    proto_extend({
      /**
       * @description 文字列のバイト数を求める
       * @memberof BufferLibChrome
       *
       * @param {String} str
       * バイト数を求めたい文字列
       * @param {Function} callback
       * 処理完了後 callback(Number) として呼び出される
       */
      getByteLength: function getByteLength(str, callback) {
        setTimeout(function() {
          callback(new Blob([str])
            .size);
        }, 0);
      }
    });

    return BufferLibChrome;
  });

})();
