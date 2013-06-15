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
                        if ( name == 'index-chrome' ) {
                            return contents.replace(/define\(.*'index-chrome'.*,/, 'define(');
                        }
                        return contents;
                    },
                    paths: {
                        jquery: 'empty:',
                        underscore: 'empty:',
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
                        if ( name == 'sources/index-node' ) {
                            return contents.replace(/define\(.*'sources\/index-node'.*,/, 'define(');
                        }
                        return contents;
                    },
                    paths: {
                        jquery: 'empty:',
                        underscore: 'empty:',
                        async: 'empty:',
                        encoding: 'empty:',
                        purl: 'empty:',
                        net: 'empty:'
                    }
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
};
