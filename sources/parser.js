/* ===================================================
 * JavaScript 2ch-client Library
 * https://github.com/sh19910711/js2ch
 * ===================================================
 * Copyright (c) 2013 Hiroyuki Sano
 *
 * Licensed under MIT License.
 * http://opensource.org/licenses/MIT
 * =================================================== */
/**
 * @fileOverview 各種データの構文解析用ライブラリ
 * @author Hiroyuki Sano
 */
(function() {
  'use strict';

  var root = this;

  define([
    'underscore',
    'jquery',
    'logger',
    'util-lib'
  ], function(_, $, logger, UtilLib) {
    /**
     * @constructor Parser
     */
    var Parser = function(options, callback_context) {
      callback_context = callback_context || this;
      options = (options && options['client']) || options || {};

      /**
       * @description 2chのデータ分割用トークン
       * @memberof Parser
       */
      this.token = '<>';
    };

    Parser.prototype = {};
    var proto = _(Parser.prototype);

    proto.extend({
      /**
       * @description スレッド一覧をオブジェクトの配列に変換する
       * @memberof Parser
       *
       * @param {String} str
       * subject.txtなどのスレッド一覧のデータ
       * @return {Array}
       * スレッド一覧をオブジェクトに変換した配列
       */
      parseThreadList: function parseThreadList(str) {

        function get_filename(str) {
          return $.trim(str);
        }

        function get_subject(str) {
          return $.trim(str.match(/(.*)\([0-9]+\)$/)[1]);
        }

        function get_responses(str) {
          return parseInt(str.match(/.*\(([0-9]+)\)$/)[1], 10);
        }

        function get_thread_info(line) {
          var splitted = UtilLib.splitString(line, this.token);
          return {
            filename: get_filename(splitted[0]),
            subject: get_subject(splitted[1]),
            responses: get_responses(splitted[1])
          };
        }

        return _(str.split('\n'))
          .reject(UtilLib.checkEmptyString)
          .map(get_thread_info.bind(this));
      }
    });

    proto.extend({
      /**
       * @description スレッドの書き込み一覧をオブジェクトの配列に変換する
       * @memberof Parser
       *
       * @param {String} str
       * datファイルなどに含まれる書き込み一覧のデータ
       * @return {Array}
       * 書き込み一覧をオブジェクトに変換した配列
       */
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

        function get_response(line, response_number) {
          var terms = line.split(this.token);
          return {
            number: response_number + 1,
            name: get_name(terms[0]),
            mail: get_mail(terms[1]),
            info: get_info(terms[2]),
            body: get_body(terms[3]),
            subject: get_subject(terms[4])
          };
        }

        var res = _(str.split('\n'))
          .reject(UtilLib.checkEmptyString)
          .map(get_response.bind(this));

        return res;
      }
    });

    proto.extend({
      /**
       * @description HTMLテキストからtitleタグの内容を取り出す
       *
       * @param {String} html_text
       * 解析するHTMLテキスト
       * @return {String}
       * titleタグの中身
       */
      parseTitleFromHTML: function parseTitleTextFromHTML(html_text) {
        var match_result = html_text.match(/<title>(.*?)<\/title>/i);
        if (Array.isArray(match_result))
          return match_result[1];
        return undefined;
      }
    });

    return Parser;
  });

})();
