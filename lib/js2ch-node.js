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
    init: function(options, callback) {
      var self = this;

      if (typeof options === 'function') {
        callback = options;
        options = {};
      }

      var index_path = './lib/index-node';
      if (typeof options.debug !== 'undefined' && options.debug) {
        index_path = './sources/index-node';
      }

      requirejs([
        'underscore',
        index_path
      ], function(_, Client) {
        _(self)
          .extend(new Client(options));
        callback();
      });
    }
  };

})();
