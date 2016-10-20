"use strict";
const _ = require('lodash');
const runSequence = require('run-sequence');
const cache = require('gulp-cached');
module.exports = (gulp, config) => {
    let option = config.option;
    let tasks = [];
    if (option.asserts) {
        _.each(_.keys(option.asserts), f => {
            if (!option.asserts[f]) {
                return;
            }
            let tsk = 'copy-' + f;
            tasks.push(tsk);
            gulp.task(tsk, () => {
                gulp.src(option.asserts[f])
                    .pipe(cache('assets-' + f))
                    .pipe(gulp.dest(option.dist));
            });
        });
    }
    gulp.task('copy-asserts', callback => {
        if (tasks.length > 0) {
            tasks.push(callback);
            runSequence.call(runSequence.use(gulp), tasks);
        }
        else {
            callback();
        }
    });
};
