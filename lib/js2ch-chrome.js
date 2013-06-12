(function() {
    'use strict';

    var root = window;

    requirejs.config({
        'paths': {
            'jquery': '../../jquery/jquery',
            'underscore': '../../underscore/underscore',
            'asyncjs': '../../async/lib/async',
            'purl': './purl',
            'encoding': '../lib/encoding'
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

    define([], function() {
        return {
            init: function(callback) {
                var self = this;

                requirejs([
                    'underscore',
                    '../lib/index-chrome'
                    // '../sources/index-chrome'
                ], function(_, client) {
                    console.log('@js2ch-chrome.js: client = ', client);
                    _(self).extend(client);
                    callback();
                });
            }
        };
    });

}).call(this);
