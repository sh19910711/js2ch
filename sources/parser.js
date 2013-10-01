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
          return {
            data: $.trim(str)
          };
        }

        function get_info(str) {
          // TODO: ここにIDなどが記録されている
          return {
            data: $.trim(str)
          };
        }

        function get_body(str) {
          return {
            data: $.trim(str)
          };
        }

        function get_subject(str) {
          return {
            data: $.trim(str)
          };
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

    proto.extend({
      parseFormFromHTML: function parseFormFromHTML(html_text) {

        var tag_list = html_text.replace(/\r/, '')
          .replace(/\n/, '')
          .match(/(<.+?>)/g);

        // formタグの開始地点かどうか判定
        var is_open_form_tag = function is_open_form_tag(line) {
          if (line[1] === '/')
            return false;
          var element = $.parseHTML(line);

          if (!Array.isArray(element) || element.length !== 1)
            return false;

          if (typeof(element[0].tagName) === 'string') {
            var tag_name = element[0].tagName.toLowerCase();
            return tag_name === 'form';
          }
          else {
            return false;
          }
        };

        // formタグの終了地点かどうか判定
        var is_close_form_tag = function is_close_form_tag(line) {
          if (line[1] !== '/')
            return false;
          line = '<' + line.substr(2);
          var element = $.parseHTML(line);

          if (!Array.isArray(element) || element.length !== 1)
            return false;

          if (typeof(element[0].tagName) === 'string') {
            var tag_name = element[0].tagName.toLowerCase();
            return tag_name === 'form';
          }
          else {
            return false;
          }
        };

        // formタグの範囲を取得する
        var get_form_ranges = function get_form_ranges(tag_list) {
          var ranges = [];
          var stack = [];
          var len = tag_list.length;
          for (var i = 0; i < len; ++i) {
            var line = tag_list[i];
            if (is_open_form_tag(line)) {
              stack.push(i);
            }
            else if (is_close_form_tag(line)) {
              ranges.push({
                first: stack[stack.length - 1],
                second: parseInt(i, 10)
              });
              stack.pop();
            }
          }
          return ranges;
        };

        var ranges = get_form_ranges(tag_list);

        // フォームのリストを取得する
        // form_list[アクション名] = 情報
        var form_list = {};
        _(ranges)
          .each(function(range) {
            var lines = tag_list.slice(range.first, range.second + 1);
            var html_text = lines.join('');
            var form_element = $.parseHTML(html_text)[0];
            var action = $(form_element)
              .attr('action');
            var method = $(form_element)
              .attr('method')
              .toLowerCase();
            var form_info = {
              action: action,
              method: method,
              params: {}
            };
            $(form_element)
              .children()
              .each(function() {
                var name = $(this)
                  .attr('name');
                var value = $(this)
                  .attr('value');
                form_info['params'][name] = value;
              });
            form_list[action] = form_info;
          })

        return form_list;
      }
    });

    return Parser;
  });

})();
