let preprocessor = "scss";

const { src, dest, parallel, series, watch } = require("gulp");
const browsersync = require("browser-sync").create();
const autoprefixer = require("gulp-autoprefixer");
const uglify = require("gulp-uglify-es").default;
const sass = require("gulp-sass")(require("sass"));
const rigger = require("gulp-rigger");
const cleancss = require("gulp-clean-css");
const imagemin = require("gulp-imagemin");
const rimraf = require("rimraf");

function browserSync() {
  browsersync.init({
    server: { baseDir: "./dist/" },
    notify: false,
    online: true,
    host: "localhost",
    port: 8080,
  });
}

function html() {
  return src("src/*.html")
    .pipe(rigger())
    .pipe(dest("dist/"))
    .pipe(browsersync.stream());
}

function styles() {
  return src("src/assets/" + preprocessor + "/main." + preprocessor + "")
    .pipe(sass())
    .pipe(
      autoprefixer({ overrideBrowserslist: ["last 3 versions"], grid: true })
    )
    .pipe(
      cleancss({
        level: { 1: { specialComments: 0 } },
      })
    )
    .pipe(dest("dist/assets/css/"))
    .pipe(browsersync.stream());
}

function scripts() {
  return src("src/assets/js/main.js")
    .pipe(rigger())
    .pipe(uglify())
    .pipe(dest("dist/assets/js/"))
    .pipe(browsersync.stream());
}

function images() {
  return src("src/assets/img/**/*.*")
    .pipe(
      imagemin({
        interlaced: true,
        optimizationLevel: 3,
        progressive: true,
        svgoPlugins: [
          {
            removeViewBox: true,
          },
        ],
      })
    )
    .pipe(dest("dist/assets/img/"));
}

function fonts() {
  return src("src/assets/fonts/**/*.*").pipe(dest("dist/assets/fonts/"));
}

function clean(callback) {
  return rimraf("./dist", callback);
}

function watchFiles() {
  watch(["src/**/*.html"], html).on("change", browsersync.reload);
  watch(["src/assets/scss/**/*.scss"], styles);
  watch(["src/assets/js/**/*.js"], scripts);
  watch(["src/assets/img/**/*.*"], images);
  watch(["src/assets/fonts/**/*.*"], fonts);
}

const build = series(clean, parallel(styles, scripts, images, fonts, html));

exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.fonts = fonts;
exports.build = build;
exports.default = parallel(styles, scripts, html, browserSync, watchFiles);
