const { src, dest, watch, series, parallel } = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const clean = require('gulp-clean');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const avif = require('gulp-avif');
const svgstore = require('gulp-svgstore');
const newer = require('gulp-newer');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');
const include = require('gulp-include');

// Styles
function styles() {
  return src('app/scss/style.scss')
    .pipe(scss({ outputStyle: 'compressed' }).on('error', scss.logError))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      cascade: false
    }))
    .pipe(concat('style.min.css'))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream());
}

// Fonts
function fonts() {
  src('app/fonts/**/*.ttf')
    .pipe(fonter({ formats: ['woff'] }))
    .pipe(dest('app/fonts'));

  return src('app/fonts/**/*.ttf')
  .pipe(ttf2woff2())
  .pipe(dest('app/fonts'))
}

// Images
function images() {
  return src(['app/images/src/*.*', '!app/images/src/*.svg'])
    .pipe(newer('app/images'))
    .pipe(avif({
      quality: 50
    }))

    .pipe(src('app/images/src/*.*'))
    .pipe(newer('app/images'))
    .pipe(webp())

    .pipe(src('app/images/src/*.*'))
    .pipe(newer('app/images'))
    .pipe(imagemin())

    .pipe(dest('app/images'))
}

// Sprites
function sprites() {
  src('app/images/sprite/*.svg')
  .pipe(svgstore())
  .pipe(dest('app/images'))
}

// Scripts
function scripts() {
  return src('app/js/main.js')
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

// Pages
function pages() {
  return src('app/pages/*.html')
  .pipe(include({
    includePaths: 'app/components'
  }))
  .pipe(dest('app'))
  .pipe(browserSync.stream())
}

// Watching
function watching() {
  browserSync.init({
    server: {
      baseDir: 'app/'
    }
  });
  watch(['app/scss/*.scss'], styles)
  watch(['app/images/src'], images)
  watch(['app/images/sprites'], sprites)
  watch(['app/js/main.js'], scripts)
  watch(['app/pages/*', 'app/components/*'], pages)
  watch(['app/*.html']).on('change', browserSync.reload)
}

// Clean Dist
function cleanDist() {
  return src('dist')
    .pipe(clean())
}

// Build
function building() {
  return src([
      'app/*html',
      'app/css/style.min.css',
      'app/fonts/**/*.woff',
      'app/fonts/**/*.woff2',
      'app/images/*.*',
      'app/icons/*.*',
      'app/js/main.min.js'
    ], {
      base: 'app'
    })
    .pipe(dest('dist'))
}

// Exports
exports.styles = styles;
exports.fonts =  fonts;
exports.images = images;
exports.sprites = sprites;
exports.scripts = scripts;
exports.watching = watching;
exports.pages = pages;
exports.cleanDist = cleanDist;
exports.building = building;
exports.build = series(cleanDist, building);
exports.default = parallel(styles, scripts, images, sprites, pages, watching);