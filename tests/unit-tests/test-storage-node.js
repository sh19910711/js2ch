(function() {
  var should = require('should');

  describe('Storage', function() {
    before(function() {
      global.requirejs = require('./requirejs-config-node');
      global.jQuery = require('jquery');
      global.window = {
        jQuery: jQuery
      };
    });

    describe('experiments', function() {

      it('setしてgetできることを確認(String)', function(done) {
        requirejs([
          'storage'
        ], function(Storage) {
          var storage = new Storage({
            target: 'test-storage-node-1.db'
          });
          storage.clear(function() {
            storage.set({
              'value': 'value 1'
            }, function() {
              storage.get('value', function(items) {
                items.value.should.be.equal('value 1');
                done();
              });
            });
          });
        });
      });

      it('setしてgetできることを確認(Array)', function(done) {
        requirejs([
          'storage'
        ], function(Storage) {
          var storage = new Storage({
            target: 'test-storage-node-2.db'
          });
          storage.clear(function() {
            storage.set({
              'value': 'value 1'
            }, function() {
              storage.get(['value'], function(items) {
                items.value.should.be.equal('value 1');
                done();
              });
            });
          });
        });
      });

      it('setしてgetできることを確認(Object)', function(done) {
        requirejs([
          'storage'
        ], function(Storage) {
          var storage = new Storage({
            target: 'test-storage-node-3.db'
          });
          storage.clear(function() {
            storage.set({
              'value': 'value 1'
            }, function() {
              storage.get({
                'value': 'hoge'
              }, function(items) {
                items.value.should.be.equal('value 1');
                done();
              });
            });
          });
        });
      });

      it('removeできているか確認', function(done) {
        requirejs([
          'storage'
        ], function(Storage) {
          var storage = new Storage({
            target: 'test-storage-node-4.db'
          });
          storage.clear(function() {
            storage.set({
              'value': 'value 1'
            }, function() {
              storage.remove('value', function() {
                storage.get('value', function(items) {
                  var t = typeof items.value;
                  t.should.be.equal('undefined');
                  storage.get({
                    'value': 'default'
                  }, function(items) {
                    items.value.should.be.equal('default');
                    done();
                  });
                });
              })
            });
          });
        });
      });

      it('clearできているか確認', function(done) {
        requirejs([
          'storage'
        ], function(Storage) {
          var storage = new Storage({
            target: 'test-storage-node-5.db'
          });
          storage.clear(function() {
            storage.set({
              'value': 'value 1'
            }, function() {
              storage.clear(function() {
                storage.get('value', function(items) {
                  var t = typeof items.value;
                  t.should.be.equal('undefined');
                  storage.get({
                    'value': 'default'
                  }, function(items) {
                    items.value.should.be.equal('default');
                    done();
                  });
                });
              })
            });
          });
        });
      });

    });

  });

})();
