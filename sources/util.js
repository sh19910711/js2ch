(function() {
  'use strict'

  define([
      'jquery',
      'underscore'
    ], function($, _) {
      var Util = function() {};

      Util.prototype = {};
      var proto = _(Util.prototype);

      proto.extend({
          // 与えられた関数をDeferredを返すように変更した関数を返す
          getDeferredFunc: function getDeferredFunc(func) {
            return function() {
              var deferred = new $.Deferred();
              var callback = arguments[arguments.length - 1];
              if (callback instanceof Function) {
                arguments[arguments.length - 1] = function() {
                  if (callback instanceof Function)
                    callback.apply(this, arguments);
                  deferred.resolve.apply(this, arguments);
                };
              } else {
                Array.prototype.push.call(arguments, function() {
                  if (callback instanceof Function)
                    callback.apply(this, arguments);
                  deferred.resolve.apply(this, arguments);
                });
              }
              func.apply(this, arguments);
              return deferred;
            };
          }
        });

      return new Util();
    });

}).call(this);
