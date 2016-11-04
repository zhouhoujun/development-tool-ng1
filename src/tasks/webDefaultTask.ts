
import * as _ from 'lodash';
import { TaskCallback, Gulp } from 'gulp';
// import * as path from 'path';
import {
    ITask, ITaskInfo, ITransform, ITaskConfig, IDynamicTaskOption,
    Operation, IDynamicTasks, task, dynamicTask
} from 'development-core';
// import * as chalk from 'chalk';
import { Server } from 'karma';
import * as path from 'path';
// import * as mocha from 'gulp-mocha';
import { IWebTaskOption } from '../WebTaskOption';
import * as browserSync from 'browser-sync';

const del = require('del');


@dynamicTask
export class WebDefaultTasks implements IDynamicTasks {
    tasks(): IDynamicTaskOption[] {
        return [
            {
                name: 'clean',
                order: 0,
                task: (config) => del(config.getDist())
            },
            {
                name: 'test',
                test: true,
                oper: Operation.test | Operation.release | Operation.deploy,
                pipe(gulpsrc: ITransform, config: ITaskConfig, dt?: IDynamicTaskOption, callback?: TaskCallback) {
                    let option = <IWebTaskOption>config.option;
                    let karmaConfigFile = option.karmaConfigFile || path.join(config.env.root, './karma.conf.js');
                    if (!path.isAbsolute(karmaConfigFile)) {
                        karmaConfigFile = path.join(config.env.root, karmaConfigFile);
                    }
                    new Server({
                        configFile: karmaConfigFile
                    }, <any>callback).start();
                },
                output: null
            }
        ];
    }
}

@task({
    group: 'serve',
    oper: Operation.build | Operation.test | Operation.e2e | Operation.release
})
export class StartService implements ITask {
    decorator: ITaskInfo;
    setup(config: ITaskConfig, gulp: Gulp) {
        let option = <IWebTaskOption>config.option;

        let dist = config.getDist()
        option.browsersync = option.browsersync || {
            server: {
                baseDir: config.getDist()
            },
            open: true,
            port: process.env.PORT || 3000,
            files: `${dist}/**/*`
        };
        let tkn = config.subTaskName('browsersync')
        gulp.task(tkn, (callback: TaskCallback) => {
            browserSync(option.browsersync, (err, bs) => {
                if (err) {
                    callback(<any>err);
                }
            });
        });

        return tkn;
    }
}
