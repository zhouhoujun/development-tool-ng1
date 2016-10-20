import { Server } from 'karma';
import { Gulp } from 'gulp';
import { TaskConfig } from 'development-tool';
import * as path from 'path';
import { Ng1BuildOption } from '../../task';

export = (gulp: Gulp, config: TaskConfig) => {

    let option: Ng1BuildOption = config.option;
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
