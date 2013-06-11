(function() {
    'use strict';

    var root = this;

    requirejs.config({
        'paths': {
            'jquery': '../../jquery/jquery',
            'underscore': '../../underscore/underscore',
            'asyncjs': '../../async/lib/async',
            'purl': './purl',
            'encoding': './encoding'
        },
        'shim': {
            'underscore': {
                'exports': '_'
            },
            'purl': {
                'deps': [
                    'jquery'
                ]
            },
            'encoding': {
                'exports': 'Encoding'
            }
        }
    });

    requirejs([
        // './index-chrome'
        '../sources/index-chrome'
    ], function(client) {
        console.log('@js2ch-chrome.js: client = ', client);
    });

}).call(this);
