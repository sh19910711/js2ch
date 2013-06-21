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
 * @fileOverview Node.js用のバッファ操作ライブラリ
 * @author Hiroyuki Sano
 **/
(function() {

  define([
    'underscore',
    'encoding',
    'logger'
  ], function(_, encoding) {
    /**
     * @constructor BufferLibNode
     */
    var BufferLib = function() {};

    BufferLib.prototype = {};
    var proto = _(BufferLib.prototype);

    proto.extend({
      /**
       * @description Bufferを文字列に変換する
       * @memberof BufferLibNode
       *
       * @param {Buffer} buf_array
       * 文字列に変換するBuffer
       * @param {Function} callback
       * 処理完了後に callback(String) として呼び出される
       */
      convertToString: function convertToString(buf_array, callback) {
        setTimeout(function() {
          callback(new Buffer(encoding.convert(buf_array, 'UTF-8', 'SJIS'))
            .toString('UTF-8'));
        }, 0);
      }
    });

    proto.extend({
      /**
       * @description 文字列をArrayBUfferに変換する
       * @memberof BufferLibNode
       *
       * @param {String} str
       * ArrayBufferに変換する文字列
       * @param {Function} callback
       * 処理完了後に callback(ArrayBuffer) として呼び出される
       */
      convertToBuffer: function convertToBuffer(str, callback) {
        setTimeout(function() {
          var buf = new ArrayBuffer(str.length * 2);
          var bufView = new Uint16Array(buf);
          for (var i = 0; i < str.length; ++i)
            bufView[i] = str.charCodeAt(i);
          callback(buf);
        }, 0);
      }
    });

    proto.extend({
      /**
       * @description 文字列のバイト数を求める
       * @memberof BufferLibNode
       *
       * @param {String} str
       * バイト数を求める文字列
       * @param {Function} callback
       * 処理完了後に callback(Number) として呼び出される
       */
      getByteLength: function getByteLength(str, callback) {
        console.log('str: ', str);
        setTimeout(function() {
          callback(Buffer.byteLength(str, 'sjis'));
        }, 0);
      }
    });

    return new BufferLib();
  });

})
  .call(this);
