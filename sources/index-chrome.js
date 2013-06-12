(function() {
    'use strict';

    var root = this;

    requirejs.config({
        'paths': {
            'client': '../sources/client',
            'socket': '../sources/socket-chrome',
            'storage': '../sources/storage-chrome',
            'http-lib': '../sources/http-lib',
            'parser': '../sources/parser',
            'logger': '../sources/logger'
        }
    });

    define([
        'client'
    ], function(client) {
        console.log('@index-chrome: test');
        return client;
    });

}).call(this);
