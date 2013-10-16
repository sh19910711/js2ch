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
  'use strict';

  var root = window;

  requirejs.config({
    'paths': {
      'jquery': '../../jquery/jquery',
      'underscore': '../../underscore/underscore',
      'backbone': '../../backbone/backbone',
      'async': '../../async/lib/async',
      'purl': '../lib/purl',
      'encoding': '../lib/encoding'
    },
    'shim': {
      'underscore': {
        'exports': '_'
      },
      'backbone': {
        'deps': ['underscore'],
        'exports': 'Backbone'
      },
      'purl': {
        'deps': [
          'jquery'
        ]
      },
      'encoding': {
        'exports': 'Encoding'
      }
    }
  });

  define([], function() {
    return {
      init: function(options, callback) {
        var self = this;

        if (typeof options === 'function') {
          callback = options;
          options = {};
        }

        var index_path = '../lib/index-chrome';
        if (typeof options.debug !== 'undefined' && options.debug) {
          index_path = '../sources/index-chrome';
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
  });

})();
