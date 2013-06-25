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
 * @fileoverview ソケット操作用のライブラリ（Chrome用）
 * @author Hiroyuki Sano
 */
(function() {
  'use strict';

  var root = this;

  define([
    'underscore',
    'util-lib'
  ], function(_, UtilLib) {

    var socket = chrome.socket;

    /**
     * @constructor SocketChrome
     */
    var SocketChrome = function(options, callback_context) {
      callback_context = callback_context || this;
      options = (options && options['socket']) || options || {};

      // Deferred設定
      var keys = ['connect', 'create', 'read', 'write'];
      _(keys)
        .each(function(key) {
          this[key] = UtilLib.getDeferredFunc(this[key], this, callback_context);
        }, this);
    };

    SocketChrome.prototype = {};
    var proto = _(SocketChrome.prototype);

    proto.extend({
      /**
       * @description ソケットを新しく作成する
       * @memberof SocketChrome
       *
       * @param {String} type
       * ソケットの種類
       * @param {Options} options
       * オプション
       * @param {SocketChrome#create-callback} callback
       * ソケット作成後に callback(Object) として呼び出される
       */
      create: function create() {
        socket.create.apply(socket, arguments);
      }
    });

    /**
     * @description ソケット作成後に callback(Object) として呼び出される
     * @callback SocketChrome#create-callback
     *
     * @param {Object} socket_info
     * 作成されたソケットに関する情報
     */

    proto.extend({
      /**
       * @description ソケットを破棄する
       * @memberof SocketChrome
       *
       * @param {Integer} socketId
       */
      destroy: function destroy() {
        socket.destroy.apply(socket, arguments);
      }
    });

    proto.extend({
      /**
       * @description 指定のホストに接続する
       * @memberof SocketChrome
       *
       * @param {Integer} socketId
       * ソケットID
       * @param {String} hostname
       * ホスト名
       * @param {Integer} port
       * ポート番号
       * @param {SocketChrome#connect-callback} callback
       * ホストへ接続後 callback(Integer) として呼び出される
       */
      connect: function connect() {
        socket.connect.apply(socket, arguments);
      }
    });

    /**
     * @description ホストへ接続後 callback(Integer) として呼び出される
     * @callback SocketChrome#connect-callback
     *
     * @param {Number} resultCode
     * 接続が成功したかどうかを表す
     */

    proto.extend({
      /**
       * @description ソケットの接続を切断する
       * @memberof SocketChrome
       *
       * @param {Integer} socketId
       * 接続を切断するソケットID
       */
      disconnect: function disconnect() {
        socket.disconnect.apply(socket, arguments);
      }
    });

    proto.extend({
      /**
       * @description 接続済みのソケットからデータを読み込む
       * @memberof SocketChrome
       *
       * @param {Integer} socketId
       * データを読み込むソケットID
       * @param {Integer} bufferSize
       * バッファサイズ
       * @param {SocketChrome#read-callback} callback
       * 読み込んだデータをbufferSizeで分割し
       * 各バッファについて callback(Object) として複数回呼び出される
       */
      read: function read() {
        socket.read.apply(socket, arguments);
      }
    });

    /**
     * @description
     * 読み込んだデータをbufferSizeで分割し
     * 各バッファについて callback(Object) として複数回呼び出される
     * @callback SocketChrome#read-callback
     *
     * @param {Object} read_info
     * データや読み込みに関する情報が含まれる
     */

    proto.extend({
      /**
       * @description 接続済みのソケットにデータを書き込む
       * @memberof SocketChrome
       *
       * @param {Integer} socketId
       * 書き込みを行うソケットID
       * @param {Buffer} data
       * 書き込みを行うデータ
       * @param {SocketChrome#write-callback} callback
       * 書き込み後に callback() として呼び出される
       */
      write: function write() {
        socket.write.apply(socket, arguments);
      }
    });

    /**
     * @description ソケットへの書き込み後に callback() として呼び出される
     * @callback SocketChrome#write-callback
     */

    return SocketChrome;
  });

})();
