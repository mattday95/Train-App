var gulp = require('gulp');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');

var styleSRC = 'src/scss/style.scss';
var styleDIST = './dist/css/';
var styleWatch = 'src/scss/**/*.scss';

var jsSRC = 'index.js';
var jsFolder = 'src/js/';
var jsDIST = './dist/js/';
var jsWatch = 'src/js/**/*.js';
var jsFiles = [jsSRC];

gulp.task( 'style', function(){
	
	gulp.src(styleSRC)
		.pipe(sourcemaps.init())
		.pipe(sass({
			errorLogToConsole : true,
			outputStyle : 'compressed'
		}))
		.on('error', console.error.bind(console))
		.pipe(autoprefixer({
			overrideBrowserslist: ['last 2 versions'], 
			cascade : false
		}))
		.pipe(rename({suffix: '.min'}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(styleDIST));
		
	return new Promise(function(resolve, reject) {

      console.log("HTTP Server Started");

      resolve();

    });
});

gulp.task('js', function(){
	
	jsFiles.map(function(entry){
		return browserify({
			entries: [jsFolder + entry]
		})
		.transform(babelify, {presets: ['env']})
		.bundle()
		.pipe(source(entry))
		.pipe(rename({extname : '.min.js'}))
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps : true}))
		.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(jsDIST))
	});
	
	return new Promise(function(resolve, reject) {

      console.log("HTTP Server Started");

      resolve();

    });
});

gulp.task('default', function() {
    gulp.watch(styleWatch, gulp.series('style'));
    gulp.watch(jsWatch, gulp.series('js'));
});

gulp.task('watch', gulp.series('default'));
