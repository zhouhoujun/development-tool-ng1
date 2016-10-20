"use strict";
const gulp_mocha_1 = require('gulp-mocha');
module.exports = (gulp, config) => {
    let option = config.option;
    gulp.task('test', () => {
        if (!option.test) {
            console.error('option test src not configed.');
            return null;
        }
        else {
            return gulp.src(option.test)
                .pipe(gulp_mocha_1.default(option.mochaOptions))
                .once('error', () => {
                process.exit(1);
            })
                .once('end', () => {
                process.exit();
            });
        }
    });
};
