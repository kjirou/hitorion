module.exports = function(grunt){

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    cssmin: {
      all: {
        // Can't use "{src:[..], dest:'..'}" format
        files: {
          'css/all.min.css': [
            'css/app.css'
          ]
        }
      }
    },

    // ref) http://www.jshint.com/docs/
    jshint: {

      options: {
        browser: true,
        devel: true,
        jquery: true,
        globals: {
          _: false // This means that you must not overwrite '_' variable
        }
      },

      files: [
        'js/functions.js',
        'js/app.js',
        'js/pages.js',
        'js/stages.js',
        'js/cards.js'
      ]

    },

    concat: {
      options: {
        separator: ';'
      },
      all: {
        files: [
          {
            src: [
              'js/underscore-min.js',
              'js/jquery-1.9.1.min.js',
              '<%= jshint.files %>'
            ],
            dest: 'js/all.js'
          }
        ]
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      dist: {
        files: [
          {
            src: 'js/all.js',
            dest: 'js/all.min.js'
          }
        ]
      }
    },

    watch: {
      js: {
        files: '<%= jshint.files %>',
        tasks: [
          'cssmin',
          'jshint',
          'concat'
        ]
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('default', [
    'cssmin',
    'jshint',
    'concat'
  ]);
  grunt.registerTask('release', [
    'cssmin',
    'jshint',
    'concat',
    'uglify'
  ]);

};
