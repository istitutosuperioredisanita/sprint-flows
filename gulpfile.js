// Generated on 2016-09-07 using generator-jhipster 3.6.1
'use strict';

var gulp = require('gulp'),
    rev = require('gulp-rev'),
    templateCache = require('gulp-angular-templatecache'),
    htmlmin = require('gulp-htmlmin'),
    imagemin = require('gulp-imagemin'),
    ngConstant = require('gulp-ng-constant'),
    rename = require('gulp-rename'),
    eslint = require('gulp-eslint'),
    del = require('del'),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync'),
//    KarmaServer = require('karma').Server,
    plumber = require('gulp-plumber'),
    changed = require('gulp-changed'),
    gulpIf = require('gulp-if');

var handleErrors = require('./gulp/handle-errors'),
    serve = require('./gulp/serve'),
    util = require('./gulp/utils'),
    copy = require('./gulp/copy'),
    inject = require('./gulp/inject'),
    build = require('./gulp/build');

var config = require('./gulp/config');

gulp.task('clean', function () {
    return del([config.dist], { dot: true });
});
gulp.task('copy:i18n', copy.i18n);
//gulp.task('copy', ['copy:i18n', 'copy:fonts', 'copy:common', 'copy:jstree', 'copy:ace', 'copy:customjs']);


gulp.task('copy:languages', copy.languages);

gulp.task('copy:fonts', copy.fonts);

gulp.task('copy:common', copy.common);

gulp.task('copy:swagger', copy.swagger);

gulp.task('copy:images', copy.images);

// custom Martin
gulp.task('copy:jstree', copy.jstree);
gulp.task('copy:ace', copy.ace);
gulp.task('copy:customjs', copy.customjs);

gulp.task('copy', gulp.series(['copy:i18n', 'copy:fonts', 'copy:common', 'copy:jstree', 'copy:ace', 'copy:customjs'], function(){}));

gulp.task('images', function () {
    return gulp.src(config.app + 'content/images/**')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(changed(config.dist + 'content/images'))
        .pipe(imagemin({optimizationLevel: 5, progressive: true, interlaced: true}))
        .pipe(rev())
        .pipe(gulp.dest(config.dist + 'content/images'))
        .pipe(rev.manifest(config.revManifest, {
            base: config.dist,
            merge: true
        }))
        .pipe(gulp.dest(config.dist))
        .pipe(browserSync.reload({stream: true}));
});


gulp.task('styles', gulp.series([], function () {
    return gulp.src(config.app + 'content/css')
        .pipe(browserSync.reload({stream: true}));
}));

gulp.task('inject:vendor', inject.vendor);

//gulp.task('inject:dep', gulp.series(['inject:test', 'inject:vendor'], function(){}));
//gulp.task('inject:dep', gulp.series(['inject:vendor'], function(){}));
gulp.task('inject:dep', gulp.series(['inject:vendor']));

gulp.task('inject:app', inject.app);

//gulp.task('inject', function() {
//    runSequence('inject:dep', 'inject:app');
//});
gulp.task('inject', gulp.series('inject:dep', 'inject:app'));

gulp.task('inject:test', inject.test);

gulp.task('inject:troubleshoot', inject.troubleshoot);

gulp.task('html', function () {
    return gulp.src(config.app + 'app/**/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(templateCache({
            module: 'sprintApp',
            root: 'app/',
            moduleSystem: 'IIFE'
        }))
        .pipe(gulp.dest(config.tmp));
});

gulp.task('assets:prod', gulp.series(['images', 'styles', 'html', 'copy:swagger', 'copy:images'], function(){ build }));

gulp.task('ngconstant:dev', function () {
    return ngConstant({
        name: 'sprintApp',
        constants: {
            VERSION: util.parseVersion(),
            DEBUG_INFO_ENABLED: true
        },
        template: config.constantTemplate,
        stream: true
    })
    .pipe(rename('app.constants.js'))
    .pipe(gulp.dest(config.app + 'app/'));
});

gulp.task('ngconstant:prod', function () {
    return ngConstant({
        name: 'sprintApp',
        constants: {
            VERSION: util.parseVersion(),
            DEBUG_INFO_ENABLED: false
        },
        template: config.constantTemplate,
        stream: true
    })
    .pipe(rename('app.constants.js'))
    .pipe(gulp.dest(config.app + 'app/'));
});

// check app for eslint errors
gulp.task('eslint', function () {
    return gulp.src(['gulpfile.js', config.app + 'app/**/*.js'])
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

// check app for eslint errors anf fix some of them
gulp.task('eslint:fix', function () {
    return gulp.src(config.app + 'app/**/*.js')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(eslint({
            fix: true
        }))
        .pipe(eslint.format())
        .pipe(gulpIf(util.isLintFixed, gulp.dest(config.app + 'app')));
});

//gulp.task('test', gulp.series(['inject:test', 'ngconstant:dev'], function (done) {
gulp.task('test', gulp.series(['ngconstant:dev'], function (done) {
//    new KarmaServer({
//        configFile: __dirname + '/' + config.test + 'karma.conf.js',
//        singleRun: true
//    }, done).start();
    done();
}));


gulp.task('watch', function () {
    gulp.watch('bower.json', ['install']);
    gulp.watch(['gulpfile.js', 'pom.xml'], ['ngconstant:dev']);
    gulp.watch(config.app + 'content/css/**/*.css', ['styles']);
    gulp.watch(config.app + 'content/images/**', ['images']);
    gulp.watch(config.app + 'app/**/*.js', ['inject:app']);
    gulp.watch([config.app + '*.html', config.app + 'app/**', config.app + 'i18n/**']).on('change', browserSync.reload);
});

//gulp.task('install', function () {
//    runSequence(['inject:dep', 'ngconstant:dev'], 'copy:languages', 'inject:app', 'inject:troubleshoot');
//});

gulp.task('install',
//    runSequence(['inject:dep', 'ngconstant:dev'], 'copy:languages', 'inject:app', 'inject:troubleshoot');
    gulp.series(gulp.parallel('inject:dep', 'ngconstant:dev'), 'copy:languages', 'inject:app', 'inject:troubleshoot'));

gulp.task('serve', gulp.series(['install'], function(){ serve } ));

//gulp.task('build', ['clean'], function (cb) {
//    runSequence(['copy', 'inject:vendor', 'ngconstant:prod', 'copy:languages'], 'inject:app', 'inject:troubleshoot', 'assets:prod', cb);
//});
gulp.task('build', gulp.series(['clean']), gulp.series(
    gulp.parallel('copy', 'inject:vendor', 'ngconstant:prod', 'copy:languages'), 'inject:app', 'inject:troubleshoot', 'assets:prod'));

gulp.task('default', gulp.series(['serve'], function(){}));
