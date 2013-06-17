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

  define([
    'underscore',
    'net',
    'encoding',
    'logger'
  ], function(_, net, encoding, logger) {
    var sockets = [];

    var Socket = function() {};

    Socket.prototype = {};
    var proto = _(Socket.prototype);

    proto.extend({
      // ソケットを作成する
      create: function create(type, options, callback) {
        var socket = new net.Socket();
        var socket_id = sockets.length;
        sockets.push(socket);
        setTimeout(callback, 0, {
          socketId: socket_id
        });
      }
    });

    proto.extend({
      // ソケットを破棄する
      destroy: function destroy(socketId) {
        sockets[socketId].destroy();
      }
    });

    proto.extend({
      // 指定のホストに接続する
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

    proto.extend({
      // 切断する
      disconnect: function disconnect(socketId) {
        sockets[socketId].destroy();
      }
    });

    proto.extend({
      // 接続済みのソケットからデータを読み込む
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
              data: new ArrayBuffer(socket.buffer.splice(0, bytes))
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

    proto.extend({
      // 接続済みのソケットにデータを書き込む
      write: function write(socketId, data, callback) {
        var data_str = ArrayBufferToString(data);
        var socket = sockets[socketId];
        socket.write(data_str, function() {
          callback();
        });
      }
    });

    function ArrayBufferToString(buf) {
      return String.fromCharCode.apply(null, new Uint16Array(buf));
    }

    return new Socket();
  });

})
  .call(this);
