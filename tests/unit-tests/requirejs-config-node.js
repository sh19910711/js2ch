(function() {
  'use strict';

  module.exports = (function() {
    var requirejs = require('requirejs');
    requirejs.config({
      baseUrl: '',
      paths: {
        'formatter': './sources/formatter',
        'logger': './sources/logger',
        'socket': './sources/socket-node',
        'buffer-lib': './sources/buffer-lib-node',
        'http-lib': './sources/http-lib',
        'storage': './sources/storage-node',
        'parser': './sources/parser',
        'client': './sources/client',
        'cookie-manager': './sources/cookie-manager',
        'util': './sources/util-lib',
        'encoding': './lib/encoding',
        'purl': './lib/purl'
      }
    });
    global.jQuery = require('jquery');
    global.window = {
      jQuery: jQuery
    };
    return requirejs;
  })
    .call();

})
  .call(this);
