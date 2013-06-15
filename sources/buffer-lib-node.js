(function() {

    define([
        'underscore',
        'encoding'
    ], function(_, encoding) {
        var BufferLib = function() {
        };

        BufferLib.prototype = {};
        var proto = _(BufferLib.prototype);

        proto.extend({
            convertToString: function convertToString(buf_array) {
                return new Buffer(encoding.convert(buf_array, 'UTF-8', 'SJIS')).toString('UTF-8');
            }
        });

        return new BufferLib();
    });

}).call(this);
