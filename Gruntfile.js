'use strict';
module.exports = function(grunt) {

    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    
    // grunt cfg 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
            dev: {
                options: {
                    sourceMap: false,
                    outputStyle: 'compressed'
                },
                files: {
                    'dist/grid.min.css': 'src/grid.scss'
                }
            },
            dist: {
                options: {
                    sourceMap: false,
                    outputStyle: 'nested'
                },
                files: {
                    'src/grid.css': 'src/grid.scss'
                }
            }
        }
    });
    
    // default task, must be defined
    grunt.registerTask('default', function() {
        grunt.task.run('sass:dev');
        grunt.task.run('sass:dist');
    });
    
}
    