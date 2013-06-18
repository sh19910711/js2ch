module.exports = function(grunt) {

  grunt.registerTask('test-node', function() {
    var done = this.async();
    var command_list = [
      'mocha',
      'test-*.js'
    ]
    var command = command_list.join(' ');
    require('child_process')
      .exec(command, function(error, stdout) {
        grunt.log.write(stdout);
        done(error);
      });
  });

};
