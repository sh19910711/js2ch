(function() {
  'use strict';

  module.exports = {
    createServer: function(port) {
      console.log('2ch mock server start');

      var express = require('express');
      var app = express();

      app.configure(function() {
        var path = require('path');
        app.use(express.static(__dirname + '/../fixtures/2ch'));
      });

      app.listen(port, '127.0.0.1');
    }
  };

})();
