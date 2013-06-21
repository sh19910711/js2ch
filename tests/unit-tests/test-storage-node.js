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

      it('setしてgetできることを確認(String)', function() {
        requirejs([
          'storage'
        ], function(storage) {
          storage.clear(function() {
            storage.set({
              'value': 'value 1'
            }, function() {
              storage.get('value', function(items) {
                items.value.should.be.equal('value 1');
              });
            });
          });
        });
      });

      it('setしてgetできることを確認(Array)', function() {
        requirejs([
          'storage'
        ], function(storage) {
          storage.clear(function() {
            storage.set({
              'value': 'value 1'
            }, function() {
              storage.get(['value'], function(items) {
                items.value.should.be.equal('value 1');
              });
            });
          });
        });
      });

      it('setしてgetできることを確認(Object)', function() {
        requirejs([
          'storage'
        ], function(storage) {
          storage.clear(function() {
            storage.set({
              'value': 'value 1'
            }, function() {
              storage.get({
                'value': 'hoge'
              }, function(items) {
                items.value.should.be.equal('value 1');
              });
            });
          });
        });
      });

      it('removeできているか確認', function() {
        requirejs([
          'storage'
        ], function(storage) {
          storage.clear(function() {
            storage.set({
              'value': 'value 1'
            }, function() {
              storage.remove('value', function() {
                storage.get('value', function(items) {
                  (typeof items.value)
                    .should.be.equal('undefined');
                  storage.get({
                    'value': 'default'
                  }, function() {
                    items.value.should.be.equal('default');
                  });
                });
              })
            });
          });
        });
      });

      it('clearできているか確認', function() {
        requirejs([
          'storage'
        ], function(storage) {
          storage.clear(function() {
            storage.set({
              'value': 'value 1'
            }, function() {
              storage.clear(function() {
                storage.get('value', function(items) {
                  (typeof items.value)
                    .should.be.equal('undefined');
                  storage.get({
                    'value': 'default'
                  }, function() {
                    items.value.should.be.equal('default');
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
