import { Gulp } from 'gulp';
import * as _ from 'lodash';
import { Ng1BuildOption } from '../../task';
import { TaskConfig } from 'development-tool';
import * as runSequence from 'run-sequence';
const cache = require('gulp-cached');

export = (gulp: Gulp, config: TaskConfig) => {
    let option: Ng1BuildOption = config.option;
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

    // console.log('register copy-asserts task by gulp', tasks);

    gulp.task('copy-asserts', callback => {
        if (tasks.length > 0) {
            tasks.push(callback);
            runSequence.call(runSequence.use(gulp), tasks);
        } else {
            callback();
        }
    });
}
