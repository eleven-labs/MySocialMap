var gulp      = require('gulp');
var concat    = require('gulp-concat');
var uglify    = require('gulp-uglify');
var jshint    = require('gulp-jshint');
var rename    = require('gulp-rename');
var gutil     = require('gulp-util');
var minifyCSS = require('gulp-minify-css');
var nodemon   = require('gulp-nodemon');

var srcDir  = './src/';
var cssDir  = './web/css/';
var fontDir  = './web/fonts/';
var dependencies = [
    './bower_components/angular/angular.min.js',
    './bower_components/angular-route/angular-route.min.js',
    './bower_components/lodash/dist/lodash.underscore.min.js',
    './bower_components/angular-google-maps/dist/angular-google-maps.js',
    './bower_components/angular-file-upload/angular-file-upload.js',
];
var cssDependencies = [
    './bower_components/bootstrap/dist/css/bootstrap.css',
];
var fontDependencies = [
    './bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.eot',
    './bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.svg',
    './bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.ttf',
    './bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.woff',
];
var recipes = {
    server: require('./recipes/server.json'),
    client: require('./recipes/client.json')
};

var onError = function (err) {
  gutil.beep();
  console.log(err.toString());
  this.emit('end');
};

gulp.task('jshint', function() {
    gulp.src('src/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter());
});

gulp.task('server', ['jshint'], function() {
    gulp.src(recipes.server.files)
        .pipe(concat(recipes.server.name))
        .pipe(uglify())
        .pipe(gulp.dest(recipes.server.path));
});

gulp.task('nodemon', ['server'], function () {
    nodemon({
        watch: recipes.server.files,
        ext: 'js',
        script: 'bin/server.js',
        restartable: "rs"
    })
    .on('change', ['server'])
});

gulp.task('front-expose', function() {
    gulp.src(dependencies)
        .pipe(concat('dependencies.js'))
        .pipe(gulp.dest(recipes.client.path));
});

gulp.task('front-min', function(){
    gulp.src(recipes.client.files)
        .pipe(concat(recipes.client.name))
        .pipe(gulp.dest(recipes.client.path));
});

gulp.task('css-expose', function() {
    gulp.src(cssDependencies)
        .pipe(concat('dependencies.css'))
        .pipe(gulp.dest(cssDir));
});

gulp.task('css-min', function() {
    gulp.src('assets/**/*.css')
        .pipe(concat('style.css'))
        .pipe(minifyCSS())
        .pipe(gulp.dest(cssDir));
});

gulp.task('font-expose', function() {
     gulp.src(fontDependencies)
        .pipe(gulp.dest(fontDir));
});

gulp.task('launch-server', ['jshint', 'server', 'nodemon']);
gulp.task('launch-client', ['front-expose', 'front-min', 'css-expose', 'css-min', 'font-expose']);

gulp.task('default', ['launch-server', 'launch-client']);
