(function() {
  var requirejs = require('requirejs');
  var _ = require('underscore');

  // chrome-apiのmock
  var chrome = {};

  // socketはnodeの物を使いまわす
  _(chrome)
    .extend({
      socket: new(requirejs('./sources/socket-node'))()
    });

  // storage.localはnodeのものを使いまわす
  _(chrome)
    .extend({
      storage: {
        local: new(requirejs('./sources/storage-node'))({
          target: 'test-mock-chrome-api-storage.db'
        })
      }
    });

  module.exports = chrome;
})();
