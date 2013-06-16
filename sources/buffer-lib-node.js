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
        'underscore',
        'encoding'
    ], function(_, encoding) {
        var BufferLib = function() {
        };

        BufferLib.prototype = {};
        var proto = _(BufferLib.prototype);

        proto.extend({
            // ArrayBufferを文字列に変換する
            convertToString: function convertToString(buf_array, callback) {
                setTimeout(function() {
                    callback(new Buffer(encoding.convert(buf_array, 'UTF-8', 'SJIS')).toString('UTF-8'));
                }, 0);
            }
        });

        proto.extend({
            // 文字列をArrayBufferに変換する
            convertToBuffer: function convertToBuffer(str, callback) {
                setTimeout(function() {
                    var buf = new ArrayBuffer(str.length * 2);
                    var bufView = new Uint16Array(buf);
                    for ( var i = 0; i < str.length; ++ i )
                        bufView[i] = str.charCodeAt(i);
                    callback(buf);
                }, 0);
            }
        });

        return new BufferLib();
    });

}).call(this);
