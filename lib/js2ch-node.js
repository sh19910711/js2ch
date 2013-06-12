(function() {

    global.requirejs = require('requirejs');

    var base_url = '';
    if ( typeof __dirname !== 'undefined' ) {
        base_url = (function(s) {
            return s.substr(0, s.length - s.match(/\/[^\/]*$/)[0].length);
        })(__dirname);

        requirejs.config({
            baseUrl: base_url 
        });
    }

    requirejs([
        // './sources/index-node'
        './lib/index-node'
    ], function(client) {
        console.log('@js2ch-node: ', client);
        return {
            test: '@js2ch-node'
        };
    });

}).call(global);
