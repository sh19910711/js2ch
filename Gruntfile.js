module.exports = function(grunt) {
    grunt.initConfig({
        requirejs: {

            buildChrome: {
                options: {
                    baseUrl: './sources',
                    name: 'index-chrome',
                    mainConfigFile: './sources/index-chrome.js',
                    out: './lib/index-chrome.js',
                    paths: {
                        jquery: 'empty:',
                        underscore: 'empty:',
                        asyncjs: 'empty:'
                    }
                }
            },

            buildNode: {
                options: {
                    baseUrl: './sources',
                    name: 'index-node',
                    mainConfigFile: './sources/index-node.js',
                    out: './lib/index-node.js',
                    useStrict: true,
                    onBuildWrite: function(name, path, contents) {
                        if ( name == 'index-node' ) {
                            return contents.replace(/define\(.*'index-node'.*,/, 'define(');
                        }
                        return contents;
                    },
                    paths: {
                        jquery: 'empty:',
                        underscore: 'empty:',
                        asyncjs: 'empty:'
                    }
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
};
