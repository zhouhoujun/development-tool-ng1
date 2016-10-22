import { Gulp, TaskCallback } from 'gulp';
import { TaskConfig } from 'development-tool';
import { WebTaskOption } from '../../task';
import * as browserSync from 'browser-sync';
// const spa = require('browser-sync-spa');

export = (gulp: Gulp, config: TaskConfig) => {
    let option: WebTaskOption = <WebTaskOption>config.option;

    let dist = config.getDist(config.option)
    option.browsersync = option.browsersync || {
        server: {
            baseDir: config.getDist(config.option)
        },
        open: true,
        port: process.env.PORT || 3000,
        files: `${dist}/**/*`
    };

    gulp.task('browsersync', (callback: TaskCallback) => {
        browserSync(option.browsersync, (err, bs) => {
            if (err) {
                callback(<any>err);
            }
        });
    });
};
