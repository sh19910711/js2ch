(function() {
    'use strict'

    define([
        'jquery',
        'underscore'
    ], function($, _) {
        var Util = function() {
        };

        Util.prototype = {};
        var proto = _(Util.prototype);

        proto.extend({
            // 与えられた関数をDeferredを返すように変更した関数を返す
            getDeferredFunc: function getDeferredFunc(func) {
                return function() {
                    var deferred = new $.Deferred();
                    if ( arguments[arguments.length - 1] instanceof Function )
                        arguments[arguments.length - 1] = deferred.resolve;
                    else
                        Array.prototype.push.call(arguments, deferred.resolve);
                    func.apply(this, arguments);
                    return deferred;
                };
            }
        });

        return new Util();
    });

}).call(this);
