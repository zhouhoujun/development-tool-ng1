import { Gulp } from 'gulp';
import * as _ from 'lodash';
import { WebTaskOption } from '../../task';
import { Src, TaskConfig } from 'development-tool';
const cache = require('gulp-cached');
import * as chalk from 'chalk';
import * as browserSync from 'browser-sync';

export = (gulp: Gulp, config: TaskConfig) => {
    let option: WebTaskOption = <WebTaskOption>config.option;
    let tasks = [];
    if (option.asserts) {

        _.each(_.keys(option.asserts), f => {
            let asst = option.asserts[f];
            if (!asst) {
                return;
            }

            let dist: string = config.getDist((_.isArray(asst) || _.isString(asst)) ? option : asst);

            if (!dist) {
                return;
            }

            let tsk = 'copy-' + f;
            tasks.push(tsk);
            let src: Src = (_.isArray(asst) || _.isString(asst)) ? asst : asst.src;

            gulp.task(tsk, () => {
                return gulp.src(src)
                    .pipe(cache('assets-' + f))
                    .pipe(gulp.dest(dist))
                    .pipe(browserSync.stream());
            });
        });
    }

    // console.log('register copy-asserts task by gulp', tasks);

    gulp.task('copy-asserts', () => {
        if (tasks.length > 0) {
            return config.runSequence(gulp, tasks);
        } else {
            console.log(chalk.yellow('has not configed asserts in option.'));
            return Promise.resolve();
        }
    });
}
