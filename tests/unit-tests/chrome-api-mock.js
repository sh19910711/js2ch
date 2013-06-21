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

  // storage.localはnodeのものを使いまわす
  _(chrome)
    .extend({
      storage: {
        local: requirejs('./sources/storage-node')
      }
    });

  module.exports = chrome;
})();
