/* ===================================================
 * JavaScript 2ch-client Library
 * https://github.com/sh19910711/js2ch
 * ===================================================
 * Copyright (c) 2013 Hiroyuki Sano
 *
 * Licensed under MIT License.
 * http://opensource.org/licenses/MIT
 * =================================================== */
(function() {

  global.requirejs = require('requirejs');
  global.jQuery = require('jquery');
  global.window = {
    jQuery: jQuery
  };

  var base_url = '';
  if (typeof __dirname !== 'undefined') {
    base_url = (function(s) {
      return s.substr(0, s.length - s.match(/\/[^\/]*$/)[0].length);
    })(__dirname);
  }

  requirejs.config({
    'baseUrl': base_url,
    'paths': {
      'encoding': './lib/encoding',
      'purl': './lib/purl'
    },
    'shim': {
      'deps': ['jquery']
    }
  });

  module.exports = {
    init: function(callback) {
      var self = this;

      requirejs([
        'underscore',
        './lib/index-node'
        // './sources/index-node'
      ], function(_, client) {
        _(self)
          .extend(client);
        callback();
      });
    }
  };

})
  .call(global);
