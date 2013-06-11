(function() {
    'use strict';

    var root = this;

    requirejs.config({
        'paths': {
            'jquery': '../../jquery/jquery',
            'underscore': '../../underscore/underscore'
        },
        'shim': {
            'underscore': {
                'exports': '_'
            }
        }
    });

    requirejs([
        '../sources/index-chrome'
    ], function(under) {
        console.log('@js2ch-chrome.js');
    });

}).call(this);
