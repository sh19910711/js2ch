(function() {
    'use strict';

    var root = this;

    requirejs.config({
        'paths': {
            'client': '../sources/client',
            'socket': './socket-node',
            'storage': './storage-node',
            'http': './http',
            'parser': './parser',
            'logger': './logger'
        }
    });

    define([
        'jquery',
        'http'
    ], function(jq, http) {
        console.log('@index-node: ', http);
        return {
            test: '@index-node.js'
        };
    });

}).call(this);
