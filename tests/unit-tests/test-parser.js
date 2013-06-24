(function() {
  var should = require('should');

  describe('Parser', function() {
    before(function() {
      global.requirejs = require('./requirejs-config-node');
      global.jQuery = require('jquery');
      global.window = {
        jQuery: jQuery
      };
    });

    describe('2ch-data', function() {

      it('#parseThreadList', function(done) {
        requirejs([
          'underscore',
          'parser'
        ], function(_, Parser) {
          var parser = new Parser();

          var thread_list = [
            'test1.dat<>test1 (1)',
            'test2.dat<>test2 (2)',
            'test3.dat<>test3 (3)',
            'test4.dat<>test4 (4)',
            'test5.dat<>test5 (5)',
            'test6.dat<>test6 (6)',
            'test7.dat<>test7 (7)',
            'test8.dat<>test8 (8)',
            'test9.dat<>test9 (9)',
          ];

          var ret = parser.parseThreadList(thread_list.join('\n'));
          ret.length.should.be.equal(thread_list.length);

          _(ret)
            .each(function(thread_info, ind) {
              var no = ind + 1;
              thread_info.filename.should.be.equal('test' + no + '.dat');
              thread_info.subject.should.be.equal('test' + no);
              thread_info.responses.should.be.equal(no);
            });

          done();
        });
      });

      it('#parseResponsesFromThread', function(done) {
        requirejs([
          'underscore',
          'parser'
        ], function(_, Parser) {
          var parser = new Parser();

          var response_list = [
            'test-name<>test-mail<>test-info<>test-body<>test-subject\n'
          ];

          var ret = parser.parseResponsesFromThread(response_list.join('\n'));
          ret.length.should.be.equal(response_list.length);

          _(ret)
            .each(function(response_info) {
              response_info.name.data.should.be.equal('test-name');
              response_info.mail.should.be.equal('test-mail');
              response_info.info.should.be.equal('test-info');
              response_info.body.should.be.equal('test-body');
              response_info.subject.should.be.equal('test-subject');
            });

          done();
        });
      });

    });

    describe('html', function() {

      describe('#parseTitleFromHTML', function() {

        it('title only, 小文字', function(done) {
          requirejs([
            'parser'
          ], function(Parser) {
            var parser = new Parser();

            var html_text = [
              '<title>Test Text</title>'
            ].join('');

            var result = parser.parseTitleFromHTML(html_text);
            result.should.be.equal('Test Text');

            done();
          });
        });

        it('title only, 大文字', function(done) {
          requirejs([
            'parser'
          ], function(Parser) {
            var parser = new Parser();

            var html_text = [
              '<TITLE>Test Text</TITLE>'
            ].join('');

            var result = parser.parseTitleFromHTML(html_text);
            result.should.be.equal('Test Text');

            done();
          });
        });

        it('simple nesting, 小文字', function(done) {
          requirejs([
            'parser'
          ], function(Parser) {
            var parser = new Parser();

            var html_text = [
              '<html>',
              '<head>',
              '<meta charset="UTF-8">',
              '<title>Test Text</title>',
              '</head>',
              '<body>',
              '<h1>Test Head</h1>',
              '</body>',
              '</html>'
            ].join('');

            var result = parser.parseTitleFromHTML(html_text);
            result.should.be.equal('Test Text');

            done();
          });
        });

        it('simple nesting, 小文字', function(done) {
          requirejs([
            'parser'
          ], function(Parser) {
            var parser = new Parser();

            var html_text = [
              '<html>',
              '<head>',
              '<meta charset="UTF-8">',
              '<TITLE>Test Text</TITLE>',
              '</head>',
              '<body>',
              '<h1>Test Head</h1>',
              '</body>',
              '</html>'
            ].join('');

            var result = parser.parseTitleFromHTML(html_text);
            result.should.be.equal('Test Text');

            done();
          });
        });

        it('複数のtitleタグ', function(done) {
          requirejs([
            'parser'
          ], function(Parser) {
            var parser = new Parser();

            var html_text = [
              '<html>',
              '<head>',
              '<meta charset="UTF-8">',
              '<TITLE>Test Text 1</TITLE>',
              '</head>',
              '<body>',
              '<TITLE>Test Text 2</TITLE>',
              '</body>',
              '</html>'
            ].join('');

            var result = parser.parseTitleFromHTML(html_text);
            result.should.be.equal('Test Text 1');

            done();
          });
        });

        it('titleタグを含まないケース', function(done) {
          requirejs([
            'parser'
          ], function(Parser) {
            var parser = new Parser();

            var html_text = [
              '<html>',
              '<head>',
              '<meta charset="UTF-8">',
              '</head>',
              '<body>',
              '</body>',
              '</html>'
            ].join('');

            var result = parser.parseTitleFromHTML(html_text);
            var type = typeof result;
            type.should.be.equal('undefined');

            done();
          });
        });

      });

    });

  });

})();
