const gulp = require("gulp"),
  sass = require("gulp-sass"),
  // postcss = require("gulp-postcss"),
  autoprefixer = require('gulp-autoprefixer'),
  // cssnano = require("cssnano"),
  sourcemaps = require("gulp-sourcemaps"),
  browserSync = require("browser-sync").create(),
  gp_concat = require('gulp-concat'),
  gp_rename = require('gulp-rename'),
  gp_uglify = require('gulp-uglify'),
  newer = require('gulp-newer'),
  imagemin = require('gulp-imagemin'),
  htmlmin = require('gulp-htmlmin'),
  del = require('del'),
  plumber = require("gulp-plumber");

var jsSrc = [];


// for sass compile auto prefix
function style() {
  return (
    gulp
      .src('app/scss/style.scss')
      // Initialize sourcemaps before compilation starts
      .pipe(sourcemaps.init())
      .pipe(sass())
      .on("error", sass.logError)
      // Use postcss with autoprefixer and compress the compiled file using cssnano
      .pipe(autoprefixer())
      // Now add/write the sourcemaps
      .pipe(sourcemaps.write())
      .pipe(gulp.dest("app/css"))
      .pipe(browserSync.stream())
  );
}

function reload(cb) {
  browserSync.reload();
  cb();
}

// Add browsersync initialization at the start of the watch task
function watch() {
  browserSync.init({
    // You can tell browserSync to use this directory and serve it as a mini-server
    server: {
      baseDir: "./app"
    }
    // If you are already serving your website locally using something like apache
    // You can use the proxy setting to proxy that instead
    // proxy: "yourlocal.dev"
  });
  gulp.watch('app/scss/**/*.scss', style);
  gulp.watch("app/*.html", reload);
  gulp.watch("app/js/*.js", reload);
}

function minifyHTML(cb) {
  gulp
    .src('lms/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('dist'))
  cb()
}

function unglifyJs(cb) {
  gulp
    .src(jsSrc)
    .pipe(plumber())
    .pipe(gp_concat('concat.js'))
    .pipe(gulp.dest('app/js/'))
    .pipe(gp_rename('main.js'))
    .pipe(gp_uglify())
    .pipe(gulp.dest('dist/js'))
  cb()
}

function concatCss(cb) {
  gulp
    .src('lms/css/*.css')
    .pipe(gp_concat("style.css"))
    .pipe(gulp.dest('dist/css/'))
  cb()
}

// Optimize Images
function images() {
  return gulp
    .src("lms/images/**/*")
    .pipe(newer("./dist/img/"))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true
            }
          ]
        })
      ])
    )
    .pipe(gulp.dest("dist/img/"));
}

function moveFont() {
  return gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'));
}

function clean() {
  return del(['dist/']);
}

exports.unglifyJs = unglifyJs;
exports.concatCss = concatCss;
exports.images = images;
exports.minifyHTML = minifyHTML;
exports.moveFont = moveFont;
exports.clean = clean;

const build = gulp.series(clean, gulp.parallel(minifyHTML, concatCss, moveFont, images));

exports.watch = watch;
exports.build = build;
