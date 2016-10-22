"use strict";
const _ = require('lodash');
const cache = require('gulp-cached');
const chalk = require('chalk');
module.exports = (gulp, config) => {
    let option = config.option;
    let tasks = [];
    if (option.asserts) {
        _.each(_.keys(option.asserts), f => {
            let asst = option.asserts[f];
            if (!asst) {
                return;
            }
            let dist = config.getDist((_.isArray(asst) || _.isString(asst)) ? option : asst);
            if (!dist) {
                return;
            }
            let tsk = 'copy-' + f;
            tasks.push(tsk);
            let src = (_.isArray(asst) || _.isString(asst)) ? asst : asst.src;
            gulp.task(tsk, () => {
                gulp.src(src)
                    .pipe(cache('assets-' + f))
                    .pipe(gulp.dest(dist));
            });
        });
    }
    gulp.task('copy-asserts', () => {
        if (tasks.length > 0) {
            return config.runSequence(gulp, tasks);
        }
        else {
            console.log(chalk.yellow('has not configed asserts in option.'));
            return Promise.resolve();
        }
    });
};

//# sourceMappingURL=../../sourcemaps/tasks/build/copy.js.map
