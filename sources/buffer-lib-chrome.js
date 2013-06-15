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
            convertToString: function convertToString(buf_array, callback) {
                var fileReader = new FileReader();
                fileReader.onloadend = function() {
                    callback(fileReader.result);
                };
                fileReader.readAsText(new Blob([result.data]), 'sjis');
            }
        });

        return new BufferLib();
    });

}).call(this);
