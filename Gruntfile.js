module.exports = function(grunt){

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    connect: {
      server: {
        options: {
          port: 8000,
          hostname: 'localhost'
        }
      }
    },

    watch: {
      js: {
        files: 'js/*.js',
        tasks: ['concat', 'uglify']
      }
    },

    concat: {
      common: {
        files: {
          'js/all.js': [
            'js/underscore-min.js',
            'js/jquery-1.9.1.min.js',
            'js/functions.js',
            'js/app.js',
            'js/pages.js',
            'js/stages.js',
            'js/cards.js'
          ]
        }
      }
    },

    uglify: {
      common: {
        files: {
          'js/all.min.js': 'js/all.js'
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib');

  grunt.registerTask('default', [
    'watch',
    'connect',
    'concat',
    'uglify'
  ]);

};
