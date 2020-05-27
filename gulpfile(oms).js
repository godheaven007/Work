var gulp = require('gulp');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-cssmin');
var rename = require("gulp-rename");
var gulpSequence = require('gulp-sequence');
var clean = require('gulp-clean');
var rev = require('gulp-rev');
// var chsiRev = require('gulp-chsi-rev');
// var imagemin = require('gulp-imagemin');
// var plugins = require('gulp-load-plugins')();
// var sftp = require('gulp-sftp');


// gulp.task('sftptest', function () {
//     return gulp.src('dist/**')
//         .pipe(plugins.sftp({
//             'host': '192.168.0.236',
//             'user': 'www',
//             'pass': 'huhoo1234',
//             "port": "22",
//             "remotePath": "/data01/opark/webapps/ibs.o.com/assets/",
//         }));
// });

// gulp.task('revCss',function () {
//     return gulp.src('css/global.css')
//         .pipe(chsiRev())
//         .pipe(gulp.dest('dist/'))
// });

gulp.task('app-js', async() => {
    return gulp.src('app/**/*.js')       // 源文件
        .pipe(uglify())           // 使用插件
        // .pipe(rename({
        //     suffix:".min"      // 给所有的文件名加上后缀.min
        //     }))
        .pipe(gulp.dest('dist/lib/app')) // 设定输出目录
});


gulp.task('config-js', async() => {
    return gulp.src('lib/*.js')       // 源文件
        .pipe(uglify())           // 使用插件
        .pipe(gulp.dest('dist/lib')) // 设定输出目录
});

gulp.task('copy-html', async() => {
    return gulp.src('html/**/*.html')
        .pipe(gulp.dest('dist/html'))
});

gulp.task('copy-image1', async() => {
    return gulp.src('images/**/*')
        .pipe(gulp.dest('dist/images'))
});
gulp.task('copy-image2', async() => {
    return gulp.src('css/**/*')
        .pipe(gulp.dest('dist/css'))
});

gulp.task('copy-lib', async() => {
    return gulp.src('lib/**/*')
        .pipe(gulp.dest('dist/lib'))
});

/*********************clean*******************/
gulp.task('clean', async() => {
    return gulp.src(
        ['dist/css',
        'dist/html',
        'dist/images',
        'dist/lib'], {read: false, allowEmpty: true})
        .pipe(clean());
});

/*********************cssmin*******************/
gulp.task('cssmin', async() => {
    return gulp.src('css/**/*.css')
        .pipe(cssmin())
        // .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist/css'));
});

/*********************imagemin*******************/
// gulp.task('imagemin', async() => {
//     return gulp.src('images/**/*')
//         .pipe(imagemin())
//         .pipe(gulp.dest('dist/images'));
// });

gulp.task('tag', function () {
    return gulp.src(['dist/**'])
        .pipe(gulp.dest('../tag/1.0.12'));
});

gulp.task('release', function () {
    return gulp.src(['dist/**'])
        .pipe(gulp.dest('../release/4.0.0'));
});

gulp.task('all', gulp.series('clean', 'app-js', 'config-js', 'cssmin', 'copy-html', 'copy-image1', 'copy-image2', 'copy-lib', function (done) {
    done();
}));

// single
// gulp.task('test', async() => {
//     return gulp.src('app/approval/info.js')       // 源文件
//         .pipe(uglify())           // 使用插件
//         .pipe(gulp.dest('dist/lib/approval/')) // 设定输出目录
// });

