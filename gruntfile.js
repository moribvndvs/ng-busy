module.exports = function(grunt) {
	// load all grunt tasks
  	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    
    var pkg = grunt.file.readJSON('package.json');
    var banner = 

	grunt.initConfig({
		pkg: pkg,
		banner: '/**'+
 '* <%= pkg.description %>\n'+
 '* @author <%= pkg.author %>\n'+
 '* @version v<%= pkg.version %>\n'+
 '* @link <%= pkg.repository.url %>\n' +
 '* @license <%= pkg.license %>\n'+
 '*/',
 		bump: {
 			options: {
 				files: ['package.json'],
 				commit: false,
 				createTag: false,
 				push: false
 			}
 		},
		karma: {
			options: {
				configFile: 'karma.conf.js'
			},
			unit: {
				singleRun: true
			},
			server: {
				autoWatch: true
			}
		},
		clean: pkg.main,
		concat: {
			options: {
				stripBanners: true,
				banner: '<%= banner %>'
			},
			js: {
				src: ['src/angular-busy-button.js'],
				dest: 'build/angular-busy-button.js'
			}
		},
		uglify: {
			js: {
				src: ['src/angular-busy-button.js'],
				dest: 'build/angular-busy-button.min.js',
				options: {
					banner: '<%= banner %>',
					sourceMap: 'build/angular-busy-button.map'
				}
			}
		}
	});

	grunt.registerTask('test', ['karma:unit']);
	grunt.registerTask('test-server', ['karma:server']);
	grunt.registerTask('build', ['clean', 'uglify','concat:js']);
};