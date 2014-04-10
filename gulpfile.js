'use strict';
var gulp = require('gulp');
var stylus = require('gulp-stylus');
var rename = require('gulp-rename');
var browserify = require('gulp-browserify');

gulp.task('stylus', function() {
  gulp.src('./assets/app/app.styl')
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

gulp.task('copy-images', function() {
  gulp.src('./assets/images/*')
    .pipe(gulp.dest('./.tmp/public/images/'));
});

gulp.task('copy-html', function() {
  gulp.src('./assets/**/*.html')
    .pipe(gulp.dest('./.tmp/public/'));
});

gulp.task('default', function() {
  gulp.run('stylus', 'browserify', 'copy-images', 'copy-html');

  gulp.watch('./assets/**/*.js', function() {
    gulp.run('browserify');
  });

  gulp.watch('./assets/images/*', function() {
    gulp.run('copy-images');
  });

  gulp.watch('./assets/**/*.html', function() {
    gulp.run('copy-html');
  });

  gulp.watch('./assets/**/*.styl', function() {
    gulp.run('stylus');
  });
});