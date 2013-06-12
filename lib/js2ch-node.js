(function() {

    global.requirejs = require('requirejs');

    var base_url = '';
    if ( typeof __dirname !== 'undefined' ) {
        base_url = (function(s) {
            return s.substr(0, s.length - s.match(/\/[^\/]*$/)[0].length);
        })(__dirname);
    }

    requirejs.config({
        'baseUrl': base_url,
        'paths': {
            'encoding': '../lib/encoding'
        }
    });

    module.exports = {
        init: function(callback) {
            var self = this;

            requirejs([
                'underscore',
                './sources/index-node'
            ], function(_, client) {
                _(self).extend(client);
                callback();
            });
        }
    };

}).call(global);
