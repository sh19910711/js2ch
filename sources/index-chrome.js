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
        'client': '../sources/client',
        'socket': '../sources/socket-chrome',
        'storage': '../sources/storage-chrome',
        'http-lib': '../sources/http-lib',
        'buffer-lib': '../sources/buffer-lib-chrome',
        'util': '../sources/util',
        'parser': '../sources/parser',
        'logger': '../sources/logger'
      }
    });

  define([
      'client'
    ], function(client) {
      return client;
    });

}).call(this);
