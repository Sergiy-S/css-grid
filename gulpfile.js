var gulp = require("gulp"), // Подключаем Gulp
  sass = require("gulp-sass"), //Подключаем Sass пакет,
  browserSync = require("browser-sync"), // Подключаем Browser Sync
  concat = require("gulp-concat"), // Подключаем gulp-concat (для конкатенации файлов)
  uglify = require("gulp-uglify"), // Подключаем gulp-uglifyjs (для сжатия JS)
  cleanCSS = require("gulp-clean-css"),
  cssnano = require("gulp-cssnano"), // Подключаем пакет для минификации CSS
  rename = require("gulp-rename"), // Подключаем библиотеку для переименования файлов
  del = require("del"), // Подключаем библиотеку для удаления файлов и папок
  imagemin = require("gulp-imagemin"), // Подключаем библиотеку для работы с изображениями
  pngquant = require("imagemin-pngquant"), // Подключаем библиотеку для работы с png
  cache = require("gulp-cache"), // Подключаем библиотеку кеширования
  autoprefixer = require("gulp-autoprefixer"), // Подключаем библиотеку для автоматического добавления префиксов
  notify = require("gulp-notify");

gulp.task("sass", function() {
  return gulp
    .src("app/sass/**/*.sass")
    .pipe(sass({ outputStyle: "expand" }).on("error", notify.onError()))
    .pipe(rename({ suffix: ".min", prefix: "" }))
    .pipe(autoprefixer(["last 15 versions"]))
    .pipe(cleanCSS()) // Опционально, закомментировать при отладке
    .pipe(gulp.dest("app/css"))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task("browser-sync", function() {
  // Создаем таск browser-sync
  browserSync({
    // Выполняем browserSync
    server: {
      // Определяем параметры сервера
      baseDir: "app" // Директория для сервера - app
    },
    notify: false // Отключаем уведомления
  });
});

gulp.task("scripts", function() {
  return gulp
    .src([
      "app/libs/jquery/dist/jquery.min.js",
      "app/js/common.js" // Всегда в конце
    ])
    .pipe(concat("scripts.min.js"))
    .pipe(uglify()) // Минимизировать весь js (на выбор)
    .pipe(gulp.dest("app/js"))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task("css-libs", ["sass"], function() {
  return gulp
    .src("app/css/normalize-css/normalize-css.css") // Выбираем файл для минификации
    .pipe(cssnano()) // Сжимаем
    .pipe(rename({ suffix: ".min" })) // Добавляем суффикс .min
    .pipe(gulp.dest("dist/css")); // Выгружаем в папку app/css
});

gulp.task("watch", ["browser-sync", "css-libs", "scripts"], function() {
  gulp.watch("app/sass/**/*.sass", ["sass"]); // Наблюдение за sass файлами в папке sass
  gulp.watch("app/*.html", browserSync.reload); // Наблюдение за HTML файлами в корне проекта
  gulp.watch("app/js/**/*.js", browserSync.reload); // Наблюдение за JS файлами в папке js
});

gulp.task("clean", function() {
  return del.sync("dist"); // Удаляем папку dist перед сборкой
});

gulp.task("img", function() {
  return gulp
    .src("app/img/**/*") // Берем все изображения из app
    .pipe(
      cache(
        imagemin({
          // С кешированием
          // .pipe(imagemin({ // Сжимаем изображения без кеширования
          interlaced: true,
          progressive: true,
          svgoPlugins: [{ removeViewBox: false }],
          use: [pngquant()]
        })
      ) /**/
    )
    .pipe(gulp.dest("dist/img")); // Выгружаем на продакшен
});

gulp.task("build", ["clean", "img", "sass", "scripts"], function() {
  var buildCss = gulp
    .src([
      // Переносим библиотеки в продакшен
      "app/css/main.min.css",
      "app/css/libs.min.css"
    ])
    .pipe(gulp.dest("dist/css"));

  var buildFonts = gulp
    .src("app/fonts/**/*") // Переносим шрифты в продакшен
    .pipe(gulp.dest("dist/fonts"));

  var buildJs = gulp
    .src("app/js/**/*") // Переносим скрипты в продакшен
    .pipe(gulp.dest("dist/js"));

  var buildHtml = gulp
    .src("app/*.html") // Переносим HTML в продакшен
    .pipe(gulp.dest("dist"));
});

gulp.task("clear", function(callback) {
  return cache.clearAll();
});

gulp.task("default", ["watch"]);
