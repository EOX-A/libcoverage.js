module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-jsdoc');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/* <%= pkg.name %> - version <%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n * See <%= pkg.homepage %> for more information! */\n',
                reoprt: 'gzip',
                preserveComment: false
            },
            compile: {
                files: {
                    'build/libcoverage.min.js': ['build/libcoverage.js']
                }
            }
        },
        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: ['pkg'],
                push: false
            }
        },
        clean: {
            build: ['build/*'],
            release: ['release/*'],
            docs: ['docs/*'],
        },
        compress: {
            release: {
                options: {
                    archive: 'release/<%= pkg.name %>.v<%= pkg.version %>.zip'
                },
                files: [
                    { expand: true, cwd: 'build', src: ['*.min.js'], dest: '<%= pkg.name %>' },
                    { expand: true, src: ['README.md', 'LICENSE'], dest: '<%= pkg.name %>' },
                ]
            }
        },
        browserify: {
            dist: {
                files: {
                    'build/libcoverage.js': ['src/browserify.js']
                },
                options: {
                }
            }
        },
        jsdoc: {
            dist: {
                src: ['src/**/*.js', 'README.md'],
                options: {
                    destination: 'docs'
                }
            }
        }
    });

    grunt.registerTask('default', ['clean:build', 'browserify', 'uglify'])
    grunt.registerTask('release', ['clean', 'docs', 'bump', 'browserify', 'uglify', 'compress:release']);
    grunt.registerTask('docs', ['clean:docs', 'jsdoc'])
}
