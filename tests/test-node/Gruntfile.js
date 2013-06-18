module.exports = function(grunt) {

  var _ = require('underscore');

  var testname_list = ['test-socket.js', 'test-http-lib.js'];

  _(testname_list)
    .each(function(testname) {
      grunt.registerTask(testname, function() {
        var done = this.async();
        var command_list = [
          'mocha',
          testname
        ]
        var command = command_list.join(' ');
        require('child_process')
          .exec(command, function(error, stdout) {
            grunt.log.write(stdout);
            done(error);
          });
      });
    });

  grunt.registerTask('default', testname_list);

};
