(function() {
  var requirejs = require('requirejs');
  var _ = require('underscore');

  // chrome-apiのmock
  var chrome = {};

  // socketはnodeの物を使いまわす
  _(chrome)
    .extend({
      socket: requirejs('./sources/socket-node')
    });

  module.exports = chrome;
})();
