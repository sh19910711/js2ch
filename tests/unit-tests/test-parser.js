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
      it('#parseThreadList (from fixture)', function(done) {
        requirejs([
          'underscore',
          'parser',
          'buffer-lib'
        ], function(_, Parser, BufferLib) {
          var parser = new Parser();
          var buffer_lib = new BufferLib();
          var fs = require('fs');
          var path = require('path');

          fs.readFile(path.resolve(__dirname, '../fixtures/2ch/news4vip/subject.txt'), function(err, data) {
            buffer_lib.convertToString(data)
              .done(function(data) {
                var ret = parser.parseThreadList(data);
                ret.length.should.be.equal(170);
                ret[0].filename.should.be.equal("1371817087.dat");
                ret[0].subject.should.be.equal("メ→ラ→ミみたいに完成した呪文やワザが&gt;&gt;1にかかるスレ");
                ret[0].responses.should.be.equal(691);
                ret[169].filename.should.be.equal("1371796143.dat");
                ret[169].subject.should.be.equal("暇な時にはgdgdしながらAA雑談");
                ret[169].responses.should.be.equal(96);
                done();
              });
          });
        });
      });

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
              response_info.mail.data.should.be.equal('test-mail');
              response_info.info.data.should.be.equal('test-info');
              response_info.body.data.should.be.equal('test-body');
              response_info.subject.data.should.be.equal('test-subject');
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

      describe('Parser#parseFormFromHTML', function() {
        it('formタグ', function(done) {
          requirejs([
            'parser'
          ], function(Parser) {
            var parser = new Parser();

            var html_text = [
              '<form method=POST action="../test/bbs.cgi?guid=ON">',
              '<input type=hidden name=subject value="">',
              '<input TYPE=hidden NAME=FROM value="">',
              '<input TYPE=hidden NAME=mail value="sage">',
              '<input type=hidden name=MESSAGE value="">',
              '<input type=hidden name=bbs value=news4vip>',
              '<input type=hidden name=time value=1372084136>',
              '<input type=hidden name=key value=1372053483>',
              '<input type=hidden name="yuki" value="akari">',
              '<input type=submit value="foo" name="bar">',
              '<br>',
              '<input type=submit value="上記全てを承諾して書き込む" name="submit">',
              '<br>',
              '</form>'
            ].join('');

            var result = parser.parseFormFromHTML(html_text);

            var action = '../test/bbs.cgi?guid=ON';
            result[action]['method'].should.be.equal('post');
            result[action]['action'].should.be.equal(action);
            result[action].params['subject'].should.be.equal('');
            result[action].params['FROM'].should.be.equal('');
            result[action].params['mail'].should.be.equal('sage');
            result[action].params['MESSAGE'].should.be.equal('');
            result[action].params['bbs'].should.be.equal('news4vip');
            result[action].params['time'].should.be.equal('1372084136');
            result[action].params['key'].should.be.equal('1372053483');
            result[action].params['yuki'].should.be.equal('akari');
            result[action].params['submit'].should.be.equal('上記全てを承諾して書き込む');

            done();
          });
        });
      });

    });

  });

})();
