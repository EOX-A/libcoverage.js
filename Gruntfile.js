module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-bump');

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
                    'build/libcoverage.min.js': ['libcoverage.wcs.js', 'libcoverage.eowcs.js'],
                    'build/libcoverage.backbone.min.js': ['integrations/libcoverage.backbone.js']
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
            release: ['release/*']
        },
        compress: {
            release: {
                options: {
                    archive: 'release/<%= pkg.name %>.v<%= pkg.version %>.zip'
                },
                files: [
                    { expand: true, cwd: 'build', src: ['*.min.js'], dest: '<%= pkg.name %>' },
                    { expand: true, src: ['README.rst', 'LICENSE'], dest: '<%= pkg.name %>' },
                ]
            }
        }
    });

    grunt.registerTask('default', ['clean:build', 'uglify'])
    grunt.registerTask('release', ['clean', 'bump', 'uglify', 'compress:release']);
}
