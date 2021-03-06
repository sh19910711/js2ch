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

  var root = this;

  requirejs.config({
    'paths': {
      'client': './sources/client',
      'client-put-utils': './sources/client-put-utils',
      'socket': './sources/socket-node',
      'storage': './sources/storage-node',
      'http-lib': './sources/http-lib',
      'parser': './sources/parser',
      'buffer-lib': './sources/buffer-lib-node',
      'util-lib': './sources/util-lib',
      'cookie-manager': './sources/cookie-manager',
      'logger': './sources/logger',
      'formatter': './sources/formatter',
      'encoding': './lib/encoding'
    }
  });

  define([
    'client'
  ], function(client) {
    return client;
  });

})();
