/* ===================================================
 * JavaScript 2ch-client Library
 * https://github.com/sh19910711/js2ch
 * ===================================================
 * Copyright (c) 2013 Hiroyuki Sano
 *
 * Licensed under MIT License.
 * http://opensource.org/licenses/MIT
 * =================================================== */
(function() {
  'use strict';

  var root = this;

  define([
    'underscore',
    'jquery',
    'logger'
  ], function(_, $, logger) {
    // 各種データの構文解析用ライブラリ
    var Parser = function() {};

    Parser.prototype = {};
    var proto = _(Parser.prototype);

    proto.extend({
      // SUBJECT.TXTのデータをオブジェクトに変換する
      parseSubjectText: function parseSubjectText(str) {
        logger.log('@Parser#parseSubjectText: str = ', str);
      }
    });

    proto.extend({
      // スレッド一覧をオブジェクトの配列に変換する
      parseThreadList: function parseThreadList(str) {
        logger.log('@Parser#parseThreadList: str = ', str);
      }
    });

    proto.extend({
      // スレッドの書き込み一覧をオブジェクトの配列に変換する
      parseResponsesFromThread: function parseResponsesFromThread(str) {
        function get_name(str) {
          var res = {};
          str = $.trim(str);
          if (str[0] == '<') {
            res = {
              data: str.match(/<\/b>(.*)<b>/)[1],
              strong: false
            };
          }
          else {
            res = {
              data: str,
              strong: true
            };
          }
          return res;
        }

        function get_mail(str) {
          // TODO: validate
          return $.trim(str);
        }

        function get_info(str) {
          // TODO: ここにIDなどが記録されている
          return $.trim(str);
        }

        function get_body(str) {
          return $.trim(str);
        }

        function get_subject(str) {
          return $.trim(str);
        }

        var res = _(str.split('\n'))
          .filter(function(line) {
            return $.trim(line)
              .length > 0;
          })
          .map(function(line, response_number) {
            var terms = line.split('<>');
            return {
              number: response_number,
              name: get_name(terms[0]),
              mail: get_mail(terms[1]),
              info: get_info(terms[2]),
              body: get_body(terms[3]),
              subject: get_subject(terms[4])
            };
          });

        return res;
      }
    });

    return new Parser();
  });

})
  .call(this);
