(function() {
    'use strict';

    var root = this;

    requirejs.config({
        'paths': {
            'client': '../sources/client',
            'socket': '../sources/socket-chrome',
            'storage': '../sources/storage-chrome',
            'http-lib': '../sources/http-lib',
            'buffer-lib': '../sources/buffer-lib-chrome',
            'util': '../sources/util',
            'parser': '../sources/parser',
            'logger': '../sources/logger'
        }
    });

    define([
        'client'
    ], function(client) {
        return client;
    });

}).call(this);
