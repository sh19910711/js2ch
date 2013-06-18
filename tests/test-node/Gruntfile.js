module.exports = function(grunt) {

  var _ = require('underscore');

  var testname_list = [
    'test-socket.js',
    'test-http-lib.js',
    'issues/test-3.js'
  ];

  _(testname_list)
    .each(function(testname) {
      grunt.registerTask(testname, function() {
        var done = this.async();
        var command_list = [
          'mocha',
          '--reporter list',
          testname
        ]
        var command = command_list.join(' ');
        require('child_process')
          .exec(command, function(error, stdout, stderr) {
            grunt.log.write(stdout);
            grunt.log.write(stderr);
            done();
          });
      });
    });

  grunt.registerTask('default', testname_list);

};
