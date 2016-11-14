
// import * as _ from 'lodash';
import { TaskCallback, Gulp } from 'gulp';
// import * as path from 'path';
import {
    ITask, ITaskInfo, ITransform, ITaskContext, IDynamicTaskOption,
    Operation, IDynamicTasks, task, dynamicTask, IAssertDist
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
                oper: Operation.clean | Operation.default,
                task: (ctx, dt) => del(ctx.getSrc(dt))
            },
            {
                name: 'test',
                oper: Operation.test | Operation.default,
                pipe(gulpsrc: ITransform, ctx: ITaskContext, dist?: IAssertDist, gulp?: Gulp, callback?: TaskCallback) {
                    let option = <IWebTaskOption>ctx.option;
                    let karmaConfigFile = option.karmaConfigFile || path.join(ctx.env.root, './karma.conf.js');
                    if (!path.isAbsolute(karmaConfigFile)) {
                        karmaConfigFile = path.join(ctx.env.root, karmaConfigFile);
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
    oper: Operation.test | Operation.e2e | Operation.default
})
export class StartService implements ITask {
    constructor(private info: ITaskInfo) {

    }
    getInfo() {
        return this.info;
    }
    setup(ctx: ITaskContext, gulp: Gulp) {
        let option = <IWebTaskOption>ctx.option;

        let dist = ctx.getDist(this.getInfo());
        option.browsersync = option.browsersync || {
            server: {
                baseDir: dist
            },
            open: true,
            port: process.env.PORT || 3000,
            files: `${dist}/**/*`
        };
        let tkn = ctx.subTaskName('browsersync');
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
