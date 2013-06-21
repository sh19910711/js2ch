(function() {

  var _ = require('underscore');

  var FileReader = function() {
  };

  FileReader.prototype = {};
  var proto = _(FileReader.prototype);

  proto.extend({
    readAsArrayBuffer: function(blob) {
      setTimeout(function() {
        if ( blob.type === 'text' ) {
          this.result = new Buffer(blob.parts[0]);
          this.onloadend();
        }
      }.bind(this), 0);
    }
  });

  proto.extend({
    readAsText: function(blob, encoding) {
      setTimeout(function() {
        var requirejs = require('requirejs');
        requirejs([
                  'encoding'
        ], function(encoding) {
          this.result = _(blob.parts[0]).map(function(v) {
            return String.fromCharCode(v);
          }).join('');
          this.onloadend();
        }.bind(this));
      }.bind(this), 0);
    }
  });

  proto.extend({
    onloadend: function() {
    }
  });

  module.exports = FileReader;
})();
