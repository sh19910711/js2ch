(function() {
    'use strict';

    var root = this;

    requirejs.config({
        'baseUrl': './components/js2ch/sources', 
        'paths': {
            'client': './client',
            'socket': './socket-chrome',
            'storage': './storage-chrome',
            'http': './http',
            'parser': './parser',
            'logger': './logger'
        }
    });

    define([
        'client'
    ], function(client) {
        console.log('@index-chrome: test');
        return client;
    });

}).call(this);
