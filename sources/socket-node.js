(function() {
    'use strict';

    var root = this;

    define([
        'underscore'
    ], function(_) {
        var Socket = function() {
        };

        Socket.prototype = {};
        var proto = _(Socket.prototype);

        proto.extend({
            // ソケットを作成する
            create: function create(type, options, callback) {
            }
        });

        proto.extend({
            // ソケットを破棄する
            destroy: function destroy(socketId) {
            }
        });

        proto.extend({
            // 指定のホストに接続する
            connect: function connect(socketId, hostname, port, callback) {
            }
        });

        proto.extend({
            // 切断する
            disconnect: function disconnect(socketId) {
            }
        });

        proto.extend({
            // 接続済みのソケットからデータを読み込む
            read: function read(socketId, bufferSize, callback) {
            }
        });

        proto.extend({
            // 接続済みのソケットにデータを書き込む
            write: function write(socketId, data, callback) {
            }
        });

        return new Socket();
    });

}).call(this);
