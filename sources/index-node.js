(function() {
    'use strict';

    var root = this;
    console.log('@index-node.js: start');

    requirejs.config({
        'paths': {
            'client': './sources/client',
            'socket': './sources/socket-node',
            'storage': './sources/storage-node',
            'http-lib': './sources/http-lib',
            'parser': './sources/parser',
            'buffer-lib': './sources/buffer-node',
            'logger': './sources/logger',
            'encoding': './lib/encoding'
        }
    });

    define([
        'client'
    ], function(client) {
        return client;
    });

}).call(this);
