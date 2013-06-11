(function() {
    'use strict';

    var root = this;

    requirejs.config({
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
        'underscore'
    ], function() {
        // TODO: 実装
        return {};
    });

}).call(this);
