const gulp = require("gulp");
const { parallel, series, watch } = require("gulp");
const browserSync = require("browser-sync");
const sass = require("gulp-sass")(require("sass"));
const autoprefixer = require("gulp-autoprefixer");
const cleanCSS = require("gulp-clean-css");
const uglify = require("gulp-uglify");
const concat = require("gulp-concat");
const rename = require("gulp-rename");
const size = require("gulp-size");
const shell = require("gulp-shell");

// Configuration
const config = {
  preprocessor: "sass",
  paths: {
    css: {
      src: "./css/pesticide.css",
      dest: "./css/",
    },
    js: {
      src: "./js/pesticide.js",
      dest: "./js/",
    },
    styles: {
      sass: "./sass/**/*.scss",
    },
    html: "./*.html",
  },
};

// Generate color table - FIXED
const generate = () => {
  return gulp
    .src("package.json") // Use any existing file as dummy input
    .pipe(shell(["node ./generate_color_table.js"]));
};

// CSS processing
const processCSS = () => {
  return gulp
    .src(config.paths.css.src)
    .pipe(cleanCSS({ compatibility: "ie8" }))
    .pipe(size({ gzip: true, showFiles: true, title: "Minified CSS" }))
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest(config.paths.css.dest))
    .pipe(browserSync.stream());
};

// JavaScript processing
const processJS = () => {
  return gulp
    .src(config.paths.js.src)
    .pipe(uglify())
    .pipe(concat("pesticide.min.js"))
    .pipe(gulp.dest(config.paths.js.dest))
    .pipe(browserSync.stream());
};

// Sass compilation
const compileSass = () => {
  return gulp
    .src(config.paths.styles.sass)
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(size({ title: "SASS Compiled" }))
    .pipe(gulp.dest(config.paths.css.dest));
};

// BrowserSync server
const serve = (done) => {
  browserSync.init({
    server: {
      baseDir: "./",
    },
    notify: false,
  });
  done();
};

// Watch files
const watchFiles = () => {
  watch(config.paths.styles.sass, series(compileSass, processCSS));
  watch(config.paths.js.src, processJS);
  watch(config.paths.html).on("change", browserSync.reload);
};

// Export tasks
exports.generate = generate;
exports.css = processCSS;
exports.js = processJS;
exports.sass = compileSass;
exports.serve = serve;
exports.watch = watchFiles;

// Default task (removed generate from main flow)
exports.default = series(
  parallel(compileSass, processCSS, processJS),
  serve,
  watchFiles,
);
