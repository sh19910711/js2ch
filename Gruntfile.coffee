module.exports = (grunt)->
  _ = grunt.util._
  async = require 'async'
  init_config = {}

  # 
  # define tasks
  #

  # jscoverage task
  grunt.registerMultiTask(
    'jscoverage'
    ''
    ()->
      done = @.async()
      opts = @.data
      grunt.util.spawn(
        {
          cmd: "jscoverage"
          args: [opts.src, opts.dest]
          opts:
            stdio: 'inherit'
        }
        (error, result)->
          done()
      )
  )

  # jsdoc task
  grunt.registerTask(
    'jsdoc',
    ()->
      done = @.async()
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


  #
  # define configs
  #

  # require.js
  _.extend(init_config, {
    requirejs:
      # generate lib/index-chrome.js
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
      # generate lib/index-node.js
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

  # jsbeautify
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

  # Mocha
  _.extend(init_config, {
    mochaTest:
      (()->
        # mochaTest: test-tap
        res = {}
        _.extend(
          res
          {
            'test-tap':
              options:
                timeout: 5000
                reporter: 'tap'
                require: [
                  'should'
                ]
                captureFile: 'test_tap_result.txt'
              src: [
                './tests/unit-tests/t*-test.js'
              ]
          }
        )
        # mochaTest:test-cov
        _.extend(
          res
          {
            'test-cov':
              options:
                timeout: 5000
                quiet: true
                reporter: 'html-cov'
                require: [
                  'should'
                ]
                captureFile: 'test_coverage.html'
              src: [
                './tests/unit-tests/t*-test.js'
              ]
          }
        )
        # mochaTest:txxx
        _.each(
          [1...100]
          (v)->
            v = v.toString()
            while v.length < 3
              v = '0' + v
            obj = {}
            obj["t" + v] =
              options:
                timeout: 5000
                reporter: 'tap'
                require: [
                  'should'
                ]
              src: [
                "./tests/**/t#{v}-*-test.js"
              ]
            _.extend res, obj
        )
        res
      )()
  })

  # jscoverage
  _.extend(init_config, {
    'jscoverage': {
      'sources':
        src: "sources"
        dest: "sources-cov"
      'lib':
        src: "lib"
        dest: "lib-cov"
    }
  })

  # Env
  _.extend(init_config, {
    env:
      'test-cov':
        COVERAGE: 1
  })

  # Clean
  _.extend(init_config, {
    clean:
      'test-cov': [
        'sources-cov'
        'lib-cov'
      ]
  })

  grunt.initConfig init_config

  # Run tests
  grunt.registerTask(
    'test'
    [
      'mochaTest:test-tap'
    ]
  )

  # Run tests with coverage
  grunt.registerTask(
    'test-cov'
    [
      'clean:test-cov'
      'env:test-cov'
      'jscoverage'
      'mochaTest:test-cov'
    ]
  )

  # Build
  grunt.registerTask(
    'build'
    [
      'test'
      'jsbeautifier'
      'requirejs'
    ]
  )

  # Documentation
  grunt.registerTask(
    'doc'
    [
      'jsbeautifier'
      'jsdoc'
    ]
  )

  # load npm tasks
  pkg = grunt.file.readJSON 'package.json'
  for task of pkg.devDependencies when /^grunt-/.test task
    grunt.loadNpmTasks task

