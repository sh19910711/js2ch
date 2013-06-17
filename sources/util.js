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
              var self = this;
              var deferred = new $.Deferred();
              var callback = arguments[arguments.length - 1];
              var args = Array.prototype.slice.apply(arguments);
              setTimeout(function() {
                if (callback instanceof Function) {
                  args[args.length - 1] = function() {
                    if (callback instanceof Function)
                      callback.apply(this, arguments);
                    deferred.resolve.apply(this, arguments);
                  };
                } else {
                  args.push(function() {
                    if (callback instanceof Function)
                      callback.apply(this, arguments);
                    deferred.resolve.apply(this, arguments);
                  });
                }
                func.apply(self, args);
              }, 0);
              return deferred;
            };
          }
        });

      proto.extend({
          // 文字列strをtokenで分割する
          splitString: function splitString(str, token) {
            var x = str.indexOf(token);
            return [str.substring(0, x), str.substring(x + token.length)];
          }
        });

      return new Util();
    });

}).call(this);
