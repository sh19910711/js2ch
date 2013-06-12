(function() {
    'use strict';

    var root = this;
    console.log('@index-node.js: start');

    requirejs.config({
        'baseUrl': './sources',
        'paths': {
            'client': './client',
            'socket': './socket-node',
            'storage': './storage-node',
            'http-lib': './http-lib',
            'parser': './parser',
            'logger': './logger'
        }
    });

    define([
        'jquery',
        'client'
    ], function(jq, client) {
        console.log('@index-node: test');
        return {};
    });

}).call(this);
