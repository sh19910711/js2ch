(function() {
    requirejs = require('requirejs');

    requirejs.config({
        nodeRequire: require
    });

    require('amdefine')(module)(function() {
        var client = require('../sources/index-node');
        console.log('@js2ch-node', client);
        return {};
    });

}).call(this);
