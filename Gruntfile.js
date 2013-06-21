module.exports = function(grunt) {

  var _ = require('underscore');
  var initConfig = {};

  _(initConfig)
    .extend({
      requirejs: {
        buildChrome: {
          options: {
            baseUrl: './sources',
            name: 'index-chrome',
            mainConfigFile: './sources/index-chrome.js',
            out: './lib/index-chrome.js',
            onBuildWrite: function(name, path, contents) {
              if (name == 'index-chrome') {
                return contents.replace(/define\(.*'index-chrome'.*,/, 'define(');
              }
              return contents;
            },
            paths: {
              jquery: 'empty:',
              underscore: 'empty:',
              backbone: 'empty:',
              async: 'empty:',
              encoding: 'empty:',
              purl: 'empty:'
            }
          }
        },
        buildNode: {
          options: {
            baseUrl: './',
            name: 'sources/index-node',
            mainConfigFile: './sources/index-node.js',
            out: './lib/index-node.js',
            useStrict: true,
            onBuildWrite: function(name, path, contents) {
              if (name == 'sources/index-node') {
                return contents.replace(/define\(.*'sources\/index-node'.*,/, 'define(');
              }
              return contents;
            },
            paths: {
              jquery: 'empty:',
              underscore: 'empty:',
              backbone: 'empty:',
              async: 'empty:',
              encoding: 'empty:',
              purl: 'empty:',
              net: 'empty:',
              sqlite3: 'empty:'
            }
          }
        }
      },

      jsbeautifier: {
        files: ['./sources/*.js', './lib/js2ch-*.js', './Gruntfile.js', 'tests/unit-tests/**/*.js'],
        options: {
          indent_size: 2,
          indent_char: ' ',
          indent_level: 0,
          indent_with_tabs: false,
          brace_style: 'end-expand',
          preserve_newlines: true,
          max_preserve_newlines: 10,
          jslint_happy: false,
          keep_array_indentation: false,
          keep_function_indentation: false,
          space_before_conditional: true,
          eval_code: false,
          indent_case: false,
          unescape_strings: false,
          break_chained_methods: true
        }
      },

      watch: {
        'test-issue-3': {
          files: ['./sources/http-lib.js', './tests/unit-tests/issues/test-3.js'],
          tasks: ['test-issue-3']
        },
        'test-issue-4': {
          files: ['./sources/socket-node.js', './tests/unit-tests/issues/test-4.js'],
          tasks: ['test-issue-4']
        },
        'enhancement': {
          files: ['./sources/*.js'],
          tasks: ['enhancement']
        }
      }

    });

  // テスト用のタスクを登録する
  var registered_test_tasks = [];
  var register_test_task = function register_test_task(testname, filepath) {
    registered_test_tasks.push({
      testname: testname,
      filepath: filepath
    });
    grunt.registerTask(testname, function func() {
      var done = this.async();
      var command_list = [
        'mocha',
        '--reporter tap',
        '--ui bdd',
        filepath
      ];
      var command = command_list.join(' ');

      require('child_process')
        .exec(command, function(error, stdout, stderr) {
          grunt.log.write(stdout);
          done(error);
        });
    });
  };

  // 並列実行（未使用）
  _(initConfig)
    .extend({
      parallel: {
        tests: {
          options: {
            grunt: true
          },
          tasks: registered_test_tasks
        }
      }
    });

  // jsdocを実行する
  grunt.registerTask('jsdoc', function() {
    var done = this.async();
    var command_list = [
      'jsdoc',
      './sources',
      './lib/js2ch-*'
    ];
    var command = command_list.join(' ');

    require('child_process')
      .exec(command, function(error, stdout, stderr) {
        grunt.log.write(stdout);
        grunt.log.write(stderr);
        done();
      });
  });

  // すべてのテストを実行する
  grunt.registerTask('all-tests', function() {
    var done = this.async();
    var command_list = [
      'mocha',
      '--reporter tap',
      '--ui bdd'
    ];
    var mocha_command = command_list.join(' ');

    var files = _(registered_test_tasks)
      .map(function(testtask) {
        return testtask.filepath
      });

    var $ = require('jquery');
    var result_code = null;

    var deferreds = _(files)
      .map(function(filepath) {
        var deferred = new $.Deferred();
        require('child_process')
          .exec(mocha_command + ' ' + filepath, function(error, stdout, stderr) {
            console.log('file: ' + filepath);
            grunt.log.write(stdout);
            if (error) {
              result_code = error;
            }
            deferred.resolve(error);
          });
        return deferred;
      });

    $.when.apply(null, deferreds)
      .done(function() {
        done(result_code);
      });
  });

  // mock用http serverを走らせる
  grunt.registerTask('run-test-servers', function() {
    this.async();
    var server = require('./tests/mocks/http-server-1')
      .createHttpServer(8654);
    var server = require('./tests/mocks/http-server-1')
      .createHttpServer(80);
  });

  // テスト用のタスクを登録する
  register_test_task('test-socket-node', './tests/unit-tests/test-socket-node.js');
  register_test_task('test-socket-chrome', './tests/unit-tests/test-socket-chrome.js');
  register_test_task('test-issue-3', './tests/unit-tests/issues/test-3.js');
  register_test_task('test-issue-4', './tests/unit-tests/issues/test-4.js');

  // 基本的な操作の登録
  grunt.registerTask('enhancement', ['doc', 'test']);
  grunt.registerTask('test', ['all-tests']);
  grunt.registerTask('build', ['jsbeautifier', 'requirejs']);
  grunt.registerTask('doc', ['jsbeautifier', 'jsdoc']);

  // pluginの登録
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-parallel');

  // 設定を反映する
  grunt.initConfig(initConfig);

};
