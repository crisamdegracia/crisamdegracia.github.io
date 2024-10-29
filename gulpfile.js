const gulp          = require('gulp');
const sass          = require('gulp-sass')(require('sass'));
const rename        = require('gulp-rename');
const concat        = require('gulp-concat');
const browsersync   = require('browser-sync').create();
const cleanCss      = require('gulp-clean-css');
const uglify        = require('gulp-uglify');

// Concat and minify CSS files
const css_loc    = './assets/scss/**/*.scss';
const css_dest   = './assets/dist/css';
const slick_font_loc  = './node_modules/slick-carousel/slick/fonts/*.*';
const slick_font_dest  = './assets/dist/css/fonts';

gulp.task('build-css', () => {
    return gulp.src(css_loc)
        .pipe(sass({outputStyle: 'compressed'}) )
        .pipe( rename( { suffix: '.min' } ) )
        .pipe(cleanCss())
        .pipe(gulp.dest(css_dest));
});

gulp.task('transfer-slick', () => {
    return gulp.src(slick_font_loc)
        .pipe(gulp.dest(slick_font_dest));
});

// Concat and minify libraries JS files
const js_loc    = './assets/js/**/*.js';
const js_dest   = './assets/dist/js';

const vendor_js = [
    './node_modules/jquery/dist/jquery.js',
    './node_modules/bootstrap/dist/js/bootstrap.bundle.js',
    './node_modules/slick-carousel/slick/slick.js',
    './node_modules/slick-lightbox/dist/slick-lightbox.js'
];
gulp.task('build-vendor-js', () => {
    return gulp.src(vendor_js)
        .pipe(uglify({
            mangle: true,
            output: {
                beautify: true,
                indent_level: 0
            }
        }))
        .pipe(concat('vendor.min.js'))
        .pipe(gulp.dest(js_dest));
});


// Concat and minify all theme JS under js_loc
gulp.task('build-js', () => {
    return gulp.src(js_loc)
        .pipe(concat('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(js_dest));
});



// Start session
gulp.task("session-start", (cb) => {
    return gulp.series('build-css', 'build-vendor-js', 'build-js', 'transfer-slick')(cb);
});

// static server and watching CSS/JS/HTML files for changes
gulp.task("server", (done) => {
    browsersync.init({
        server: './assets',
        directory: true,
        open: false
    });


    // Watch for file changes
    gulp.watch(css_loc, gulp.series('build-css'), browsersync.reload);
    gulp.watch(js_loc, gulp.series('build-js'), browsersync.reload);
});

gulp.task('default', gulp.series('session-start', 'server'));
