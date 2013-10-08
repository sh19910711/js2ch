module.exports = (grunt)->
  _ = require 'underscore'
  async = require 'async'
  init_config = {}

  _.extend(init_config, {
    requirejs:
      buildChrome:
        options:
          baseUrl: './sources'
          name: 'index-chrome'
          mainConfigFile: './sources/index-chrome.js'
          out: './lib/index-chrome.js'
          onBuildWrite: (name, path, contents)->
            if name == 'index-chrome'
              return contents.replace(/define\(.*'index-chrome'.*,/, 'define(')
            contents
          paths:
            jquery: 'empty:'
            underscore: 'empty:'
            backbone: 'empty:'
            async: 'empty:'
            encoding: 'empty:'
            purl: 'empty:'
      buildNode:
        options:
          baseUrl: './'
          name: 'sources/index-node'
          mainConfigFile: './sources/index-node.js'
          out: './lib/index-node.js'
          useStrict: true
          onBuildWrite: (name, path, contents)->
            if (name == 'sources/index-node')
              return contents.replace(/define\(.*'sources\/index-node'.*,/, 'define(')
            contents
          paths:
            jquery: 'empty:'
            underscore: 'empty:'
            backbone: 'empty:'
            async: 'empty:'
            encoding: 'empty:'
            purl: 'empty:'
            net: 'empty:'
            sqlite3: 'empty:'
  })

  _.extend(init_config, {
    jsbeautifier:
      files: [
        './sources/*.js'
        './lib/js2ch-*.js'
        './Gruntfile.js'
        'tests/unit-tests/**/*.js'
        'tests/mocks/**/*.js'
      ]
      options:
        js:
          indent_size: 2
          indent_char: ' '
          indent_level: 0
          indent_with_tabs: false
          brace_style: 'end-expand'
          preserve_newlines: true
          max_preserve_newlines: 10
          jslint_happy: false
          keep_array_indentation: false
          keep_function_indentation: false
          space_before_conditional: true
          eval_code: false
          indent_case: false
          unescape_strings: false
          break_chained_methods: true
  })

  _.extend(init_config, {
    watch:
      'test-issue-3':
        files: ['./sources/http-lib.js', './tests/unit-tests/issues/test-3.js']
        tasks: ['test-issue-3']
      'test-issue-4':
        files: ['./sources/socket-node.js', './tests/unit-tests/issues/test-4.js']
        tasks: ['test-issue-4']
      'enhancement':
        files: ['./sources/**/*.js', './tests/unit-tests/**/*.js']
        tasks: ['enhancement']
      'testing':
        files: ['./tests/unit-tests/**/*.js']
        tasks: ['testing']
      'implement':
        files: ['./sources/**/*.js', './tests/unit-tests/**/*.js']
        tasks: ['implement']
  })

  grunt.initConfig init_config

  # テスト用のタスクを登録する
  registered_test_tasks = []
  register_test_task = (testname, filepath)->
    registered_test_tasks.push
      testname: testname
      filepath: filepath
    grunt.registerTask(testname, ()->
      done = @.async()
      command_list = [
        'mocha'
        '--reporter tap'
        '--ui bdd'
        filepath
      ]
      command = command_list.join(' ')
      require('child_process').exec(
        command
        (error, stdout, stderr)->
          grunt.log.write(stdout)
          done(error)
      )
    )

  # Well-knownポートを必要とするテストを登録する
  registered_test_need_well_known_ports_tasks = []
  register_test_task_need_wellknown_ports = (testname, filepath)->
    registered_test_need_well_known_ports_tasks.push
      testname: testname
      filepath: filepath
    grunt.registerTask(testname, ()->
      done = @.async()
      command_list = [
        'mocha'
        '--reporter tap'
        '--ui bdd'
        filepath
      ]
      command = command_list.join(' ')
      require('child_process').exec(
        command
        (error, stdout, stderr)->
          grunt.log.write(stdout)
          done(error)
      )
    )

  # jsdocを実行する
  grunt.registerTask('jsdoc', ()->
    done = this.async()
    command_list = [
      'jsdoc'
      './sources'
      './lib/js2ch-*'
    ]
    command = command_list.join(' ')
    require('child_process').exec(
      command
      (error, stdout, stderr)->
        grunt.log.write(stdout)
        grunt.log.write(stderr)
        done()
    )
  )

  # すべてのテストを実行する
  grunt.registerTask('all-tests', ()->
    cnt = 0
    done = @.async()
    require('child_process')
      .exec(
        'rm result.txt && touch result.txt'
        (error, stdout, stderr)->
          command_list = [
            'mocha'
            '--reporter tap'
            '--ui bdd'
            '--timeout 10000'
          ]
          mocha_command = command_list.join(' ')
          files = _(registered_test_tasks)
            .map((testtask)->
              testtask.filepath
            )
          $ = require('jquery')
          result_code = null
          deferred_all = new $.Deferred()
          cnt = 0

          run_test = (filepath, callback)->
            cnt += 1
            require('child_process')
              .exec(
                mocha_command + ' ' + filepath + ' > test_result/test_tap_result.' + cnt + '.txt'
                (error, stdout, stderr)->
                  grunt.log.write(stdout)
                  if error
                    result_code = error
                  callback(error)
              )

          async.series(
            _(files)
            .map(
              (filepath)->
                run_test.bind(null, filepath)
            ),
            ()->
              done(result_code)
          )
      )
  )

  # すべてのテストを実行する
  grunt.registerTask('all-tests-normal', ()->
    cnt = 0
    done = @.async()
    command_list = [
      'mocha'
      '--reporter tap'
      '--ui bdd'
      '--timeout 10000'
    ]
    mocha_command = command_list.join(' ')

    files = _(registered_test_tasks)
      .map((testtask)->
        testtask.filepath
      )

    $ = require('jquery')
    result_code = null
    deferred_all = new $.Deferred()
    cnt = 0

    run_test = (filepath, callback)->
      cnt++
      require('child_process')
        .exec(mocha_command + ' ' + filepath, (error, stdout, stderr)->
          grunt.log.write(stdout)
          grunt.log.write(stderr)
          if error
            result_code = error
          callback(error)
        )

    async.series(
      _(files)
      .map((filepath)->
        run_test.bind(null, filepath)
      ),
      ()->
        done(result_code)
    )
  )

  # すべてのテストを実行する
  grunt.registerTask('all-tests-coverages', ()->
    cnt = 0
    done = @.async()
    require('child_process')
      .exec(
        'rm result.txt && touch result.txt'
        (error, stdout, stderr)->
          command_list = [
            'mocha'
            '--reporter html-cov'
            '--ui bdd'
            '--timeout 10000'
          ]
          mocha_command = command_list.join(' ')
          files = _(registered_test_tasks)
            .map((testtask)->
              return testtask.filepath
            )

          $ = require('jquery')
          result_code = null
          deferred_all = new $.Deferred()
          cnt = 0

          run_test = (filepath, callback)->
            cnt += 1
            require('child_process')
              .exec('COVERAGE=1 ' + mocha_command + ' ' + filepath + ' > coverages/result.' + cnt + '.html', (error, stdout, stderr)->
                grunt.log.write(stdout)
                if error
                  result_code = error
                callback(error)
              )

          async.series(
            _(files)
            .map((filepath)->
              run_test.bind(null, filepath)
            ),
            ()->
              done(result_code)
          )
      )
  )

  # すべてのテストを実行する(Well-known ports)
  grunt.registerTask('all-tests-need-well-known-ports', ()->
    done = @.async()
    command_list = [
      'mocha'
      '--reporter tap'
      '--ui bdd'
      '--timeout 10000'
    ]
    mocha_command = command_list.join(' ')
    files = _(registered_test_need_well_known_ports_tasks)
      .map((testtask)->
        testtask.filepath
      )

    $ = require('jquery')
    result_code = null
    deferred_all = new $.Deferred()

    run_test = (filepath, callback)->
      require('child_process')
        .exec(mocha_command + ' ' + filepath, (error, stdout, stderr)->
          grunt.log.write(stdout)
          if error
            result_code = error
          callback(error)
        )

    async.series(
      _(files)
      .map((filepath)->
        run_test.bind(null, filepath)
      ),
      ()->
        done(result_code)
    )
  )

  # タスクの開始を遅らせる
  grunt.registerTask('delay-tasks', ()->
    done = this.async()
    setTimeout(
      ()->
        done()
      100
    )
  )

  grunt.registerTask('coverage', ()->
    done = @.async()
    require('child_process')
      .exec(
        'rm -rf sources-cov && jscoverage sources sources-cov && echo ok'
        (error, stdout, stderr)->
          console.log(stdout, stderr)
          require('child_process')
            .exec('rm -rf lib-cov && jscoverage lib lib-cov && echo ok', (error, stdout, stderr)->
              console.log(stdout, stderr)
              grunt.task.run('all-tests-coverages')
              done()
            )
      )
  )

  # テスト用のタスクを登録する
  register_test_task('test-socket-node', './tests/unit-tests/t005-socket-node-test.js')
  register_test_task('test-socket-chrome', './tests/unit-tests/t004-socket-chrome-test.js')
  register_test_task('test-issue-3', './tests/unit-tests/issues/test-3.js')
  register_test_task('test-storage-node', './tests/unit-tests/t007-storage-node-test.js')
  register_test_task('test-storage-chrome', './tests/unit-tests/t006-storage-chrome-test.js')
  register_test_task('test-client', './tests/unit-tests/t001-client-test.js')
  register_test_task('test-parser', './tests/unit-tests/t003-parser-test.js')
  register_test_task('test-cookie-manager', './tests/unit-tests/t002-cookie-manager-test.js')
  register_test_task_need_wellknown_ports('test-http-lib', './tests/unit-tests/test-http-lib.js')
  register_test_task_need_wellknown_ports('test-issue-4', './tests/unit-tests/issues/test-4.js')

  # 基本的な操作の登録
  grunt.registerTask('enhancement', ['delay-tasks', 'jsbeautifier', 'doc', 'test'])
  grunt.registerTask('testing', ['delay-tasks', 'jsbeautifier', 'test'])
  grunt.registerTask('implement', ['delay-tasks', 'jsbeautifier', 'test'])
  grunt.registerTask('document', ['delay-tasks', 'jsbeautifier', 'doc'])

  grunt.registerTask('test', ['all-tests'])
  grunt.registerTask('test-normal', ['all-tests-normal'])
  grunt.registerTask('test-well-known-ports', ['all-tests-need-well-known-ports'])
  grunt.registerTask('build', ['jsbeautifier', 'requirejs'])
  grunt.registerTask('doc', ['jsbeautifier', 'jsdoc'])

  # pluginの登録
  grunt.loadNpmTasks('grunt-contrib-requirejs')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-jsbeautifier')


