(function() {

    global.requirejs = require('requirejs');

    requirejs([
        './sources/index-node'
    ], function(client) {
        console.log('@js2ch-node: ', client);
        return {
            test: '@js2ch-node'
        };
    });

}).call(global);
