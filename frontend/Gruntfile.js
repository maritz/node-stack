// Generated on 2013-03-06 using generator-webapp 0.1.5
'use strict';
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var mountFolder = function(connect, dir) {
  return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to match all subfolders:
// 'test/spec/**/*.js'

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-jade');

  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // configurable paths
  var yeomanConfig = {
    app: 'app',
    dist: 'dist'
  };

  grunt.initConfig({
    yeoman: yeomanConfig,
    watch: {
      livereload: {
        files: [
          '<%= yeoman.app %>/*.html',
          '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
          '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,webp}'
          ],
        tasks: ['livereload']
      },
      stylus: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.styl'],
        tasks: ['stylus']
      },
      jade: {
        files: [
          '<%= yeoman.app %>/index.jade',
          '<%= yeoman.app %>/../../i18n/{,*/}*.js', // this updates the i18n hashes
          '<%= yeoman.app %>/scripts/templates/*.html'
          ],
        tasks: ['jade']
      }
    },
    connect: {
      options: {
        port: 3502,
        // change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function(connect) {
            return [
            lrSnippet,
            mountFolder(connect, '.tmp'),
            mountFolder(connect, 'app')];
          }
        }
      },
      test: {
        options: {
          middleware: function(connect) {
            return [
            mountFolder(connect, '.tmp'),
            mountFolder(connect, 'test')];
          }
        }
      },
      dist: {
        options: {
          middleware: function(connect) {
            return [
            mountFolder(connect, 'dist')];
          }
        }
      }
    },
    open: {
      server: {
        path: 'http://localhost:<%= connect.options.port %>'
      }
    },
    clean: {
      dist: ['.tmp', '<%= yeoman.dist %>/*'],
      server: '.tmp'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/scripts/{,*/}*.js',
        '!<%= yeoman.app %>/scripts/vendor/*',
        'test/spec/{,*/}*.js'
        ]
    },
    mocha: {
      all: {
        options: {
          run: true,
          urls: ['http://localhost:<%= connect.options.port %>/index.html']
        }
      }
    },
    // not used since Uglify task does concat,
    // but still available if needed
    /*concat: {
            dist: {}
        },*/
    requirejs: {
      dist: {
        // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
        options: {
          // `name` and `out` is set by grunt-usemin
          baseUrl: 'app/scripts',
          optimize: 'none',
          // TODO: Figure out how to make sourcemaps work with grunt-usemin
          // https://github.com/yeoman/grunt-usemin/issues/30
          //generateSourceMaps: true,
          // required to support SourceMaps
          // http://requirejs.org/docs/errors.html#sourcemapcomments
          preserveLicenseComments: false,
          useStrict: true,
          wrap: true,
          //uglify2: {}, // https://github.com/mishoo/UglifyJS2
          paths: {
            jquery: "../components/jquery/jquery",
            nohmValidations: "empty:",
            jade: "empty:"
          }
        }
      }
    },
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>'
      }
    },
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        dirs: ['<%= yeoman.dist %>']
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    cssmin: {
      dist: {
        files: {
          '<%= yeoman.dist %>/styles/style.css': [
            '.tmp/styles/{,*/}*.css',
            '<%= yeoman.app %>/styles/{,*/}*.css'
            ]
        }
      }
    },
    htmlmin: {
      dist: {
        options: {
          /*removeCommentsFromCDATA: true,
                    // https://github.com/yeoman/grunt-usemin/issues/44
                    //collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true*/
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: '*.html',
          dest: '<%= yeoman.dist %>'
        }]
      }
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,txt}',
            '.htaccess'
            ]
        }, /*{
          expand: true,
          dot: false,
          cwd: '<%= yeoman.app %>/components/requirejs/',
          dest: '<%= yeoman.dist %>/scripts/vendor/',
          src: [
            'require.js',
            ]
        },*/ {
          expand: true,
          dot: false,
          cwd: '<%= yeoman.app %>/scripts/templates/',
          dest: '<%= yeoman.dist %>/scripts/templates/',
          src: [
            '*.compiled.js',
            ]
        }]
      }
    },
    bower: {
      all: {
        rjsConfig: '<%= yeoman.app %>/scripts/main.js'
      }
    },
    stylus: {
      compile: {
        options: {
          compress: false,
          paths: ['node_modules/grunt-contrib-stylus/node_modules']
        },
        files: {
          '<%= yeoman.app %>/styles/style.css': ['<%= yeoman.app %>/styles/style.styl']
        }
      }
    },
    // compiles index.jade to index.html
    jade: {
      compile: {
        options: {
          pretty: true,
          compileDebug: false,
          data: {
            client: false,
            i18n_hashes: function () {
              return require(__dirname+'/../helpers/i18n.js').getHashes();
            }
          }
        },
        files: {
          "<%= yeoman.app %>/index.html": ["<%= yeoman.app %>/index.jade"]
        }
      },
      amd: {
        options: {
          client: true,
          multi_file: true,
          namespace: false,
          compileDebug: false,
          data: {
            client: false,
          }
        },
        files: [{
          expand: true,
          src: "<%= yeoman.app %>/scripts/templates/*.html",
          ext: ".compiled.js"
        }]
      }
    }
  });

  grunt.renameTask('regarde', 'watch');

  grunt.registerTask('server', function(target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'stylus',
      'jade',
      'livereload-start',
      'connect:livereload',
      'open',
      'watch'
      ]);
  });
  
  grunt.registerTask('test', [
    'clean:server',
    'stylus',
    'jade',
    'connect:test',
    'mocha'
    ]);

  grunt.registerTask('build', [
    'clean:dist',
    'stylus',
    'jade',
    'useminPrepare',
    'requirejs',
    'imagemin',
    'htmlmin',
    'concat',
    'cssmin',
    'copy',
    'uglify',
    'usemin'
    ]);

  grunt.registerTask('default', [
    'jshint',
    'test',
    'build'
    ]);
};
