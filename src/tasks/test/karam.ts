import { Server } from 'karma';
import { Gulp } from 'gulp';
import { TaskConfig } from 'development-tool';
import * as path from 'path';
import { WebTaskOption } from '../../task';

export = (gulp: Gulp, config: TaskConfig) => {

    let option: WebTaskOption = config.option;
    let karmaConfigFile = option.karmaConfigFile || './karma.conf.js'
    if (!path.isAbsolute(karmaConfigFile)) {
        karmaConfigFile = path.join(config.env.root, karmaConfigFile);
    }

    gulp.task('test', (callback) => {
        new Server({
            configFile: karmaConfigFile
        }, callback).start();
    });
};
