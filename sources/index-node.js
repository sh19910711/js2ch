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
        },
        'shims': {
            'underscore': {
                exports: '_'
            }
        }
    });

    require('amdefine')(module)(['underscore', 'client'], function(unde, client) {
        // TODO: 実装
        console.log('unde = ', unde);
        console.log('@index-node.js: test');
        return {};
    });

}).call(this);
