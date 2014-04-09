'use strict';
var gulp = require('gulp');
var stylus = require('gulp-stylus');
var rename = require('gulp-rename');
var browserify = require('gulp-browserify');

gulp.task('stylus', function() {
  gulp.src('./assets/styles/styles.styl')
    .pipe(stylus({
      use: ['nib'],
      compress: false
    }))
    .pipe(gulp.dest('./.tmp/public/styles/'));
});

gulp.task('browserify', function() {
  gulp.src('./assets/app/app.js')
    .pipe(browserify({
      insertGlobals: true,
      debug: false
    }))
    .pipe(rename('app.js'))
    .pipe(gulp.dest('./.tmp/public/js/'));
});

// gulp.task('copy', function() {
//   gulp.src('./assets/js/socket.io.js')
//     .pipe(gulp.dest('./.tmp/public/js/'));
//   gulp.src('./assets/js/sails.io.js')
//     .pipe(gulp.dest('./.tmp/public/js/'));

//   gulp.src('./assets/js/socket.io.js')
//     .pipe(gulp.dest('./.tmp/public/js/'));
// });

gulp.task('copy-images', function() {
  gulp.src('./assets/images/*')
    .pipe(gulp.dest('./.tmp/public/images/'));
});

gulp.task('default', function() {
  gulp.run('stylus', 'browserify', 'copy-images');

  gulp.watch('./assets/js/**/*', function() {
    gulp.run('browserify');
  });

  gulp.watch('./assets/images/*', function() {
    gulp.run('copy-images');
  });

  gulp.watch('./assets/styles/*.styl', function() {
    gulp.run('stylus');
  });
});