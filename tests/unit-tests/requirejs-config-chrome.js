(function() {
  'use strict';

  module.exports = (function() {
    var requirejs = require('requirejs');
    requirejs.config({
      baseUrl: '',
      paths: {
        'formatter': './sources/formatter',
        'logger': './sources/logger',
        'socket': './sources/socket-chrome',
        'buffer-lib': './sources/buffer-lib-chrome',
        'http-lib': './sources/http-lib',
        'util': './sources/util',
        'encoding': './lib/encoding',
        'purl': './lib/purl'
      }
    });
    global.jQuery = require('jquery');
    global.window = {
      jQuery: jQuery
    };
    global.chrome = require('./chrome-api-mock');
    global.FileReader = require('./filereader-mock');
    global.Blob = require('./blob-mock');
    return requirejs;
  })
    .call();

})
  .call(this);
