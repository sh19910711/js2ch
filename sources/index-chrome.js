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
        // TODO: 実装
        console.log('@index-chrome: test');
        return {};
    });

}).call(this);
