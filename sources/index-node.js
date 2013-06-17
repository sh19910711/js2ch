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
        'socket': './sources/socket-node',
        'storage': './sources/storage-node',
        'http-lib': './sources/http-lib',
        'parser': './sources/parser',
        'buffer-lib': './sources/buffer-lib-node',
        'util': './sources/util',
        'logger': './sources/logger',
        'encoding': './lib/encoding'
      }
    });

  define([
      'client'
    ], function(client) {
      return client;
    });

}).call(this);
