module.exports = function(grunt) {

  var _ = require('underscore');
  var async = require('async');
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
        files: [
          './sources/*.js',
          './lib/js2ch-*.js',
          './Gruntfile.js',
          'tests/unit-tests/**/*.js',
          'tests/mocks/**/*.js'
        ],
        options: {
          js: {
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
          files: ['./sources/**/*.js', './tests/unit-tests/**/*.js'],
          tasks: ['enhancement']
        },
        'testing': {
          files: ['./tests/unit-tests/**/*.js'],
          tasks: ['testing']
        },
        'implement': {
          files: ['./sources/**/*.js', './tests/unit-tests/**/*.js'],
          tasks: ['implement']
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
        filepath,
      ];
      var command = command_list.join(' ');

      require('child_process')
        .exec(command, function(error, stdout, stderr) {
          grunt.log.write(stdout);
          done(error);
        });
    });
  };

  // Well-knownポートを必要とするテストを登録する
  var registered_test_need_well_known_ports_tasks = [];
  var register_test_task_need_wellknown_ports = function register_test_task(testname, filepath) {
    registered_test_need_well_known_ports_tasks.push({
      testname: testname,
      filepath: filepath
    });
    grunt.registerTask(testname, function func() {
      var done = this.async();
      var command_list = [
        'mocha',
        '--reporter tap',
        '--ui bdd',
        filepath,
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
    var cnt = 0;
    var done = this.async();
    require('child_process')
      .exec('rm result.txt && touch result.txt', function(error, stdout, stderr) {
        var command_list = [
          'mocha',
          '--reporter tap',
          '--ui bdd',
          '--timeout 10000'
        ];
        var mocha_command = command_list.join(' ');

        var files = _(registered_test_tasks)
          .map(function(testtask) {
            return testtask.filepath
          });

        var $ = require('jquery');
        var result_code = null;

        var deferred_all = new $.Deferred();

        var cnt = 0;

        function run_test(filepath, callback) {
          cnt++;
          require('child_process')
            .exec(mocha_command + ' ' + filepath + ' > test_result/test_tap_result.' + cnt + '.txt', function(error, stdout, stderr) {
              grunt.log.write(stdout);
              if (error) {
                result_code = error;
              }
              callback(error);
            });
        }

        async.series(
          _(files)
          .map(function(filepath) {
            return run_test.bind(null, filepath);
          }),
          function() {
            done(result_code);
          }
        );
      });
  });

  // すべてのテストを実行する
  grunt.registerTask('all-tests-normal', function() {
    var cnt = 0;
    var done = this.async();
    var command_list = [
      'mocha',
      '--reporter tap',
      '--ui bdd',
      '--timeout 10000'
    ];
    var mocha_command = command_list.join(' ');

    var files = _(registered_test_tasks)
      .map(function(testtask) {
        return testtask.filepath
      });

    var $ = require('jquery');
    var result_code = null;

    var deferred_all = new $.Deferred();

    var cnt = 0;

    function run_test(filepath, callback) {
      cnt++;
      require('child_process')
        .exec(mocha_command + ' ' + filepath, function(error, stdout, stderr) {
          grunt.log.write(stdout);
          grunt.log.write(stderr);
          if (error) {
            result_code = error;
          }
          callback(error);
        });
    }

    async.series(
      _(files)
      .map(function(filepath) {
        return run_test.bind(null, filepath);
      }),
      function() {
        done(result_code);
      }
    );
  });

  // すべてのテストを実行する
  grunt.registerTask('all-tests-coverages', function() {
    var cnt = 0;
    var done = this.async();
    require('child_process')
      .exec('rm result.txt && touch result.txt', function(error, stdout, stderr) {
        var command_list = [
          'mocha',
          '--reporter html-cov',
          '--ui bdd',
          '--timeout 10000'
        ];
        var mocha_command = command_list.join(' ');

        var files = _(registered_test_tasks)
          .map(function(testtask) {
            return testtask.filepath
          });

        var $ = require('jquery');
        var result_code = null;

        var deferred_all = new $.Deferred();

        var cnt = 0;

        function run_test(filepath, callback) {
          cnt++;
          require('child_process')
            .exec('COVERAGE=1 ' + mocha_command + ' ' + filepath + ' > coverages/result.' + cnt + '.html', function(error, stdout, stderr) {
              grunt.log.write(stdout);
              if (error) {
                result_code = error;
              }
              callback(error);
            });
        }

        async.series(
          _(files)
          .map(function(filepath) {
            return run_test.bind(null, filepath);
          }),
          function() {
            done(result_code);
          }
        );
      });
  });

  // すべてのテストを実行する(Well-known ports)
  grunt.registerTask('all-tests-need-well-known-ports', function() {
    var done = this.async();
    var command_list = [
      'mocha',
      '--reporter tap',
      '--ui bdd',
      '--timeout 10000'
    ];
    var mocha_command = command_list.join(' ');

    var files = _(registered_test_need_well_known_ports_tasks)
      .map(function(testtask) {
        return testtask.filepath
      });

    var $ = require('jquery');
    var result_code = null;

    var deferred_all = new $.Deferred();

    function run_test(filepath, callback) {
      require('child_process')
        .exec(mocha_command + ' ' + filepath, function(error, stdout, stderr) {
          grunt.log.write(stdout);
          if (error) {
            result_code = error;
          }
          callback(error);
        });
    }

    async.series(
      _(files)
      .map(function(filepath) {
        return run_test.bind(null, filepath);
      }),
      function() {
        done(result_code);
      }
    );

  });

  grunt.registerTask('run-server-80', function() {
    this.async();
    var server = require('./tests/mocks/http-server-1');
    server.createHttpServer(80);
  });

  grunt.registerTask('delay-tasks', function() {
    var done = this.async();
    setTimeout(function() {
      done();
    }, 100);
  });

  grunt.registerTask('coverage', function() {
    var done = this.async();
    require('child_process')
      .exec('rm -rf sources-cov && jscoverage sources sources-cov && echo ok', function(error, stdout, stderr) {
        console.log(stdout, stderr);
        require('child_process')
          .exec('rm -rf lib-cov && jscoverage lib lib-cov && echo ok', function(error, stdout, stderr) {
            console.log(stdout, stderr);
            grunt.task.run('all-tests-coverages')
            done();
          });
      });
  });

  // テスト用のタスクを登録する
  register_test_task('test-socket-node', './tests/unit-tests/test-socket-node.js');
  register_test_task('test-socket-chrome', './tests/unit-tests/test-socket-chrome.js');
  register_test_task('test-issue-3', './tests/unit-tests/issues/test-3.js');
  register_test_task('test-storage-node', './tests/unit-tests/test-storage-node.js');
  register_test_task('test-storage-chrome', './tests/unit-tests/test-storage-chrome.js');
  register_test_task('test-client', './tests/unit-tests/t001-client-test.js');
  register_test_task('test-parser', './tests/unit-tests/test-parser.js');
  register_test_task('test-cookie-manager', './tests/unit-tests/t002-cookie-manager-test.js');
  register_test_task_need_wellknown_ports('test-http-lib', './tests/unit-tests/test-http-lib.js');
  register_test_task_need_wellknown_ports('test-issue-4', './tests/unit-tests/issues/test-4.js');

  // 基本的な操作の登録
  grunt.registerTask('enhancement', ['delay-tasks', 'jsbeautifier', 'doc', 'test']);
  grunt.registerTask('testing', ['delay-tasks', 'jsbeautifier', 'test']);
  grunt.registerTask('implement', ['delay-tasks', 'jsbeautifier', 'test']);
  grunt.registerTask('document', ['delay-tasks', 'jsbeautifier', 'doc']);

  grunt.registerTask('test', ['all-tests']);
  grunt.registerTask('test-normal', ['all-tests-normal']);
  grunt.registerTask('test-well-known-ports', ['all-tests-need-well-known-ports']);
  grunt.registerTask('build', ['jsbeautifier', 'requirejs']);
  grunt.registerTask('doc', ['jsbeautifier', 'jsdoc']);

  // pluginの登録
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jsbeautifier');

  // 設定を反映する
  grunt.initConfig(initConfig);

};
