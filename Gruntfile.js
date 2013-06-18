module.exports = function(grunt) {
  grunt.initConfig({

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
      files: ['./sources/*.js', './lib/js2ch-*.js', './Gruntfile.js', 'tests/test-node/**/*.js'],
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
    }

  });

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-jsbeautifier');
};
