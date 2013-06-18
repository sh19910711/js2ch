(function() {
  'use strict';

  module.exports = (function() {
    var requirejs = require('requirejs');
    requirejs.config({
      baseUrl: '',
      paths: {
        'formatter': '../../sources/formatter',
        'logger': '../../sources/logger',
        'socket': '../../sources/socket-node',
        'buffer-lib': '../../sources/buffer-lib-node',
        'encoding': '../../lib/encoding',
        'purl': '../../lib/purl'
      }
    });
    return requirejs;
  })
    .call();

})
  .call(this);
