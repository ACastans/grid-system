'use strict';

module.exports = function(grunt) {

	// load all grunt tasks
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
	
	var fs = require('fs');

	var pkg =  grunt.file.readJSON('package.json');

	var bakeOptions = {
   		basePath : "dev/html",
   		content :{
	        "basePath"			: "../../../",
			"noprodPath"		: "../"+pkg.path.dev+pkg.path.noprod,
			"cssPath" 			: pkg.path.css,
			"htmlPath" 			: pkg.path.html
   		}		
	};

	grunt.initConfig({
		

		// Watch
		watch: {
			layout : {
				files   : [pkg.path.dev+pkg.path.html+'**/*.html'],
				tasks   : ['bake:dev','htmlmin'],
				event   : ['added','changed']
			},																		   
			sass 	: {
				files 	: [pkg.path.dev+pkg.path.libsass+'**/*.scss'],
				tasks   : ['sass:dev'],
				event   : ['added', 'changed']
			}
		},

		// HTML Templating
		//NOT A NORMAL TASK SETUP SEE REGISTERED TASK f_bake
		bake: {
        	dev: {
        		options : bakeOptions,
        		files : [{
					expand   : true,
					flatten  : false,
					cwd      : pkg.path.dev+pkg.path.html,
					src      : ['**/*.html'],
					dest     : pkg.path.dist+pkg.path.html
				}]
   	    	},
   	    	dist: {
   	    		options : bakeOptions,
        		files : [{
					expand   : true,
					flatten  : false,
					cwd      : pkg.path.dev+pkg.path.html,
					src      : ['**/*.html'],
					dest     : pkg.path.dist+pkg.path.html,
				}]
   	    	}
  		}, 	
		// HTML Minification
		htmlmin: {
			dev: {
				options: {
					removeComments     : true,
					collapseWhitespace : true
				},
				files:[{
					expand : true,          
					cwd    : pkg.path.dist+pkg.path.html,
					src    : ['**/*.html'],
					dest   : pkg.path.dist+pkg.path.htmlmin
				}]
			}
		},
		sass :{
			dev: { 
					options: {
						sourceComments : 'map',
                		outputStyle: 'nested'
            		},
		          	files:[{
					expand : true,          
					cwd    : pkg.path.dev+pkg.path.libsass,
					src    : ['**/*.scss'],
					dest   : pkg.path.dist+pkg.path.css,
					ext    : '.css'
				}]
		      },
		      dist: { 
					options: {
						sourceComments : 'none',
                		outputStyle: 'nested'
            		},
		          	files:[{
					expand : true,          
					cwd    : pkg.path.dev+pkg.path.libsass,
					src    : ['**/*.scss'],
					dest   : pkg.path.dist+pkg.path.css,
					ext    : '.css'
				}]
		      }	
		},
		// CSS Minification
		cssmin : {
			options : {
				keepSpecialComments : 0
			},
			dist: {
				expand  : true,
				cwd     : pkg.path.dist+pkg.path.css,
				src     : ['*.css'],
				dest    : pkg.path.dist+pkg.path.css
			}
		},
		// Copy
		copy: {
			custom :{
				files: [{
					expand : true,
					cwd    : pkg.path.config+'bake/',
					src    : [
								'!**',
								'bake.js',
						],
					dest   : 'node_modules/grunt-bake/tasks/'
				}]
			}
		},
		search: {
        	scss: {
            	files: {
                	src: [pkg.path.dev+pkg.path.libsass+'**/*.scss']
            	},
            	options: {
					searchString: /@import.['\"]?([\w-_\/\.]*scss)['\"]?/g,
                	logFormat : "custom",
                	customLogFormatCallback : function(){},
                    onMatch: function(match) {
                    	grunt.event.emit('searchMatch', match, "scss")      
               		},
               		onComplete : function(matches){
               			grunt.event.emit('searchComplete', matches, "scss")
               		}
            	}
        	},
        	comment : {
        		files : {
        			src: [pkg.path.dev+pkg.path.libsass+'**/*.scss']
        		},
        		options : {
        			searchString: /^[\/]{0,2}[\/\*]{0,1}[^\t].@import/g,
        			logFormat : "custom",
        			customLogFormatCallback : function(){},
        			onComplete : function(matches){
        				grunt.event.emit('searchComplete', matches, "comment")
        			}
        		}
        	}
    	}
	});
	
	// Default task(s), must be defined
	grunt.registerTask('default', function(){});


/* Checking @import / scss rep */
	var cssClean = cssClean || {};
	(function(object, undefined){
		
		var _matchArray = new Array();
		var _importArray = new Array();
		var _uniqueArray = new Array();
		var _indexArray = new Array();
		var _fsArray = grunt.file.expand(pkg.path.dev+pkg.path.libsass+"**/*.scss","!"+pkg.path.dev+pkg.path.libsass+"*.scss");

		var _searchComplete = function(matches, target) {
			switch(target){
				case "scss":
						grunt.log.subhead("Verifying @import file path exists");
						var warning = false;
               			_uniqueArray = _importArray.filter(_onlyUnique);  
               			// filtering matchArray object to match uniqueArray path object only
               			for(var i=_matchArray.length;i--;i>=0){
               				if(_indexArray.indexOf(i)==-1){
								_matchArray.splice(i,1)
               				}
               			}              			
						// parse uniqueArray and find if an @import rule has a corresponding file.
        				for(var i=_uniqueArray.length;i--;i>=0) {
							var _tmp = _fsArray.indexOf(_uniqueArray[i]);
							if(_tmp===-1){
								warning = true;
								grunt.log.error();
								grunt.log.error("No fs file matches "+_matchArray[i].match+" in "+_matchArray[i].file);
							}
						}
						if(!warning){
							grunt.log.ok();
						}

       					grunt.log.subhead("Verifying scss file has @import rule")
						warning = false;
						// parse fsArray and find if a file has a corresponding @import rule.
						// /dev/libsass/*.scss are excluded, as they're not supposed to be import with @import in other scss files
						for(var i=_fsArray.length;i--;i>=0) {
							var _tmp = _uniqueArray.indexOf(_fsArray[i]);
							if(_tmp===-1){
								warning = true;
								grunt.log.error();
								grunt.log.error("no @import rule found for : "+_fsArray[i]);
							}		
						}
						
						if(!warning){
							grunt.log.ok();
						}
				break;
				case "comment":
					grunt.log.subhead("Verifying commented @import")
					grunt.log.error();
					grunt.log.error(matches.numMatches+" @import rules are commented.");
       				for(var i in matches.matches){
       					grunt.log.error(i);
       					for(var j in matches.matches[i]){
       						grunt.log.writeln(" line " +matches.matches[i][j].line )
       					}	
   					}				
				break;				
			}
			
		}
		var _searchMatch = function(match,target) {
			switch(target){
				case "scss":
					_matchArray.push(match);
                    // Rebuild @import absolute path
                    var _pathArray = match.file.split('/');
                    var _path=new String();
                    for(var i=0;i<=(_pathArray.length-2);i++){
                    	_path += _pathArray[i]+'/';
                    }
                    var _tmp = _path+match.match.replace('@import ','').replace('"','').replace('\'','').replace('.scss\'','.scss').replace('.scss"','.scss');
                   	// Store rebuild path
                   	_importArray.push(_tmp);				
				break;
				case "comment":
				break;				
			}			
		}
		var _onlyUnique = function(value, index, self) {
			// build an index array, we'll use to filter matchArray
			// matchArray'll only contain uniqueArray corresponding data
			if(self.indexOf(value) === index) {
				_indexArray.push(index);
			}
			// building uniqueArray
    		return self.indexOf(value) === index;
		}	
		var _init = function(){
			grunt.event.on('searchComplete', _searchComplete)
			grunt.event.on('searchMatch', _searchMatch)
		}
		
		_init()
	})(cssClean);


	grunt.registerTask('ScssClean', function() {
		grunt.task.run('search:scss');
		grunt.task.run('search:comment');
	});

/* //Checking @import / scss rep */

/* Copy modified bake after a fresh npm install */

	grunt.registerTask('Install', function() {
		grunt.task.run('copy:custom');
	});

/* // Copy modified bake after a fresh npm install */

	grunt.registerTask('Dev', function() {
		if(grunt.file.isDir('dist')) {
			grunt.file.delete('dist')
		};
		grunt.task.run(
			'bake:dist',
			'htmlmin',
			'copy',
			'sass:dev',
			'ScssClean',
			'watch'
		);
	});

	grunt.registerTask('Dist', function(){
		if(grunt.file.isDir('dist')) {
			grunt.file.delete('dist')
		};
		grunt.task.run(
			'bake:dist',
			'htmlmin',		
			'copy',
			'sass:dist',			
			'cssmin'
		);
	});
};
