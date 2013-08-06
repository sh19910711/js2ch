(function() {
  'use strict';

  module.exports = (function() {
    var requirejs = require('requirejs');
    if ( process.env.COVERAGE ) {
      requirejs.config({
        baseUrl: '',
        paths: {
          'formatter': './sources-cov/formatter',
          'logger': './sources-cov/logger',
          'socket': './sources-cov/socket-node',
          'buffer-lib': './sources-cov/buffer-lib-node',
          'http-lib': './sources-cov/http-lib',
          'storage': './sources-cov/storage-node',
          'parser': './sources-cov/parser',
          'client': './sources-cov/client',
          'cookie-manager': './sources-cov/cookie-manager',
          'util-lib': './sources-cov/util-lib',
          'encoding': './lib/encoding',
          'purl': './lib/purl'
        }
      });
    } else {
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
          'util-lib': './sources/util-lib',
          'encoding': './lib/encoding',
          'purl': './lib/purl'
        }
      });
    }
    global.jQuery = require('jquery');
    global.window = {
      jQuery: jQuery
    };
    return requirejs;
  })
    .call();

})
  .call(this);
