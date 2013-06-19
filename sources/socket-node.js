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
 * @fileOverview Node.js用のソケット操作用ライブラリ
 * @author Hiroyuki Sano
 */
(function() {
  'use strict';

  var root = this;

  define([
    'underscore',
    'net',
    'encoding',
    'logger'
  ], function(_, net, encoding, logger) {
    var sockets = [];

    /**
     * @constructor SocketNode
     */
    var Socket = function() {};

    Socket.prototype = {};
    var proto = _(Socket.prototype);

    proto.extend({
      // ソケットを作成する
      /**
       * @description ソケットを新しく作成する
       * @memberof SocketNode
       *
       * @param {String} type
       * ソケットの種類
       * @param {Options} options
       * オプション
       * @param {SocketNode#create-callback} callback
       * ソケット作成後に callback(Object) として呼び出される
       */
      create: function create(type, options, callback) {
        var socket = new net.Socket();
        var socket_id = sockets.length;
        sockets.push(socket);
        setTimeout(callback, 0, {
          socketId: socket_id
        });
      }
    });

    /**
     * @description ソケット作成後に callback(Object) として呼び出される
     * @callback SocketNode#create-callback
     *
     * @param {Object} socket_info
     * 作成されたソケットに関する情報
     */

    proto.extend({
      /**
       * @description ソケットを破棄する
       * @memberof SocketNode
       *
       * @param {Integer} socketId
       */
      destroy: function destroy(socketId) {
        sockets[socketId].destroy();
      }
    });

    proto.extend({
      /**
       * @description 指定のホストに接続する
       * @memberof SocketNode
       *
       * @param {Integer} socketId
       * ソケットID
       * @param {String} hostname
       * ホスト名
       * @param {Integer} port
       * ポート番号
       * @param {SocketNode#connect-callback} callback
       * ホストへ接続後 callback(Integer) として呼び出される
       */
      connect: function connect(socketId, hostname, port, callback) {
        var socket = sockets[socketId];
        socket.connect(port, hostname, function() {
          callback(0);
        });
        socket.resultCode = 1;
        socket.buffer = [];
        socket.readCallbacks = [];
        socket.needBytes = 0;
        socket.byteCount = 0;
        socket.finished = false;
        socket.on('data', function(chunk) {
          var array_data = _(chunk)
            .map(function(v) {
              return v;
            });
          socket.buffer = socket.buffer.concat(array_data);
          socket.byteCount += array_data.length;
        });
        socket.on('end', function() {
          socket.finished = true;
        });
      }
    });

    /**
     * @description ホストへ接続後 callback(Integer) として呼び出される
     * @callback SocketNode#connect-callback
     *
     * @param {Number} resultCode
     * 接続が成功したかどうかを表す
     */

    proto.extend({
      /**
       * @description ソケットの接続を切断する
       * @memberof SocketNode
       *
       * @param {Integer} socketId
       * 接続を切断するソケットID
       */
      disconnect: function disconnect(socketId) {
        sockets[socketId].destroy();
      }
    });

    proto.extend({
      /**
       * @description 接続済みのソケットからデータを読み込む
       * @memberof SocketNode
       *
       * @param {Integer} socketId
       * データを読み込むソケットID
       * @param {Integer} bufferSize
       * バッファサイズ
       * @param {SocketNode#read-callback} callback
       * 読み込んだデータをbufferSizeで分割し
       * 各バッファについて callback(Object) として複数回呼び出される
       */
      read: function read(socketId, bufferSize, callback) {
        var socket = sockets[socketId];
        var interval_timer = setInterval(function() {
          if (!socket.finished)
            return;
          clearInterval(interval_timer);
          if (socket.byteCount >= bufferSize) {
            var bytes = Math.min(bufferSize, socket.byteCount);
            socket.byteCount -= bytes;
            callback({
              resultCode: 1,
              data: socket.buffer.splice(0, bytes)
            });
          }
          else if (socket.byteCount > 0) {
            var bytes = socket.byteCount;
            socket.byteCount -= bytes;
            callback({
              resultCode: 1,
              data: socket.buffer.splice(0, bytes)
            });
          }
          else {
            callback({
              resultCode: -1
            });
          }
        }, 10);
      }
    });

    /**
     * @description
     * 読み込んだデータをbufferSizeで分割し
     * 各バッファについて callback(Object) として複数回呼び出される
     * @callback SocketNode#read-callback
     *
     * @param {Object} read_info
     * データや読み込みに関する情報が含まれる
     */

    proto.extend({
      /**
       * @description 接続済みのソケットにデータを書き込む
       * @memberof SocketNode
       *
       * @param {Integer} socketId
       * 書き込みを行うソケットID
       * @param {Buffer} data
       * 書き込みを行うデータ
       * @param {SocketNode#write-callback} callback
       * 書き込み後に callback() として呼び出される
       */
      write: function write(socketId, data, callback) {
        var data_str = ArrayBufferToString(data);
        var socket = sockets[socketId];
        socket.write(data_str, function() {
          callback();
        });
      }
    });

    /**
     * @description ソケットへの書き込み後に callback() として呼び出される
     * @callback SocketNode#write-callback
     */

    function ArrayBufferToString(buf) {
      return String.fromCharCode.apply(null, new Uint16Array(buf));
    }

    return new Socket();
  });

})
  .call(this);
