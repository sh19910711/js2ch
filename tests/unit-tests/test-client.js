(function() {
  var should = require('should');

  describe('Client', function() {
    before(function() {
      global.requirejs = require('./requirejs-config-node');
      global.jQuery = require('jquery');
      global.window = {
        jQuery: jQuery
      };
    });

    describe('experiments', function() {

      describe('取得系のテスト', function() {
        it('Client#getThreadList', function(done) {
          requirejs([
            'client'
          ], function(client) {
            client.getThreadList('localhost:8080', 'news4vip', function(thread_list) {
              thread_list.length.should.be.equal(170);
              done();
            });
          });
        });
      });

    });

  });

})();
