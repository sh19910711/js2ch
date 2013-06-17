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

  define([
    'underscore',
    'encoding',
    'logger'
  ], function(_, encoding, logger) {
    var BufferLib = function() {};

    BufferLib.prototype = {};
    var proto = _(BufferLib.prototype);

    proto.extend({
      // 文字列をArrayBufferに変換する
      convertToString: function convertToString(buf_array, callback) {
        var fileReader = new FileReader();
        fileReader.onloadend = function() {
          callback(fileReader.result);
        };
        fileReader.readAsText(new Blob([new Uint8Array(buf_array)]), 'sjis');
      }
    });

    proto.extend({
      // 文字列をArrayBufferに変換する
      convertToBuffer: function convertToBuffer(str, callback) {
        var fileReader = new FileReader();
        fileReader.onloadend = function() {
          callback(fileReader.result);
        };
        fileReader.readAsArrayBuffer(new Blob([str]));
      }
    });

    proto.extend({
      // 文字列のバイト数を求める
      getByteLength: function getByteLength(str, callback) {
        setTimeout(function() {
          callback(new Blob([str])
            .size);
        }, 0);
      }
    });

    return new BufferLib();
  });

})
  .call(this);