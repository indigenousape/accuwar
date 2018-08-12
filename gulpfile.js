
var gulp = require('gulp');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var useref = require('gulp-useref');
var sass = require('gulp-sass');
var gulpIf = require('gulp-if');
var uglify = require('gulp-uglify');

// Compiles SASS
gulp.task('sass', function(done){
  return gulp.src('./scss/styles.scss')
    .pipe(sass()) // Using gulp-sass
    .pipe(gulp.dest('./css'))
    .pipe(cleanCSS())
    .pipe(rename('styles.min.css'))
    .pipe(gulp.dest('./css'));

   done();
});

// Watch SASS for changes
gulp.task('watch', function(done){
	gulp.watch('scss/*.scss', gulp.parallel('sass'));

	done();
});

// Concatenates all JS files into two files, one for all App scripts, another for vendor scripts
// Controls are in the markup on the index template
gulp.task('distjs', function(done) {
  return gulp.src('./index.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest('dist'));

  done();
});

// Move vendor CSS files
gulp.task('distcss', function(done) {
  return gulp.src(['./css/styles.min.css', './css/animate.min.css', './css/bootstrap.min.css'])
    .pipe(useref())
    .pipe(gulp.dest('dist/css'));

  done();
});

// Move Robots.txt and other txt files
gulp.task('txt', function(done) {
  return gulp.src(['./robots.txt', './backlog.txt', './releasenotes.txt'])
    .pipe(useref())
    .pipe(gulp.dest('dist'));

  done();
});

// Moves font files into dist folder
gulp.task('fonts', function(done) {
	return gulp.src('./fonts/*')
	.pipe(gulp.dest('dist/fonts'));

	done();
});


// Moves images into dist folder
gulp.task('images', function(done) {
	return gulp.src('./images/*.+(png|jpg|gif|svg)')
	.pipe(gulp.dest('dist/images'));

	done();
});

// Moves root images into dist folder
gulp.task('rootImages', function(done) {
	return gulp.src('./*.+(png|jpg|gif|svg|ico)')
	.pipe(gulp.dest('dist/'));

	done();
});

// Moves audio into dist folder
gulp.task('audio', function(done) {
	return gulp.src('./audio/*.+(mp3)')
	.pipe(gulp.dest('dist/audio'));

	done();
});

// Production build

gulp.task('prodbuild', gulp.series('distjs', 'distcss', 'fonts', 'images', 'rootImages', 'audio', 'txt'));
