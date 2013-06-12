({
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
})
