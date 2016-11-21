
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


// @dynamicTask
// export class WebDefaultTasks implements IDynamicTasks {
//     tasks(): IDynamicTaskOption[] {
//         return [
//             {
//                 name: 'clean',
//                 order: 0,
//                 oper: Operation.clean | Operation.default,
//                 task: (ctx, dt) => del(ctx.getSrc(dt))
//             }
//         ];
//     }
// }

@task({
    order: 0,
    oper: Operation.clean | Operation.default
})
export class Clean implements ITask {
    constructor(private info: ITaskInfo) {
    }
    getInfo() {
        this.info.name = this.info.name || 'clean';
        return this.info;
    }
    setup(ctx: ITaskContext, gulp: Gulp) {
        let info = this.getInfo();
        let tkn = ctx.subTaskName(info);
        gulp.task(tkn, (callback: TaskCallback) => {
            del(ctx.getSrc(info));
        });

        return tkn;
    }
}


@task({
    order: 0.25, // last order.
    oper: Operation.build | Operation.test
})
export class BuildTest implements ITask {
    constructor(private info: ITaskInfo) {
    }
    getInfo() {
        this.info.name = this.info.name || 'test';
        return this.info;
    }
    setup(ctx: ITaskContext, gulp: Gulp) {
        let option = <IWebTaskOption>ctx.option;

        let tkn = ctx.subTaskName(this.getInfo());
        gulp.task(tkn, (callback: TaskCallback) => {
            let karmaConfigFile = option.karmaConfigFile || path.join(ctx.env.root, './karma.conf.js');
            if (!path.isAbsolute(karmaConfigFile)) {
                karmaConfigFile = path.join(ctx.env.root, karmaConfigFile);
            }
            let cfg = null;
            if (option.karmaConfig) {
                cfg = option.karmaConfig(ctx);
            }
            new Server(_.extend(cfg || {}, {
                configFile: karmaConfigFile
            }), <any>callback).start();
        });

        return tkn;
    }
}

@task({
    order: 0.25, // last order.
    oper: Operation.deploy | Operation.release | Operation.test
})
export class DeployTest implements ITask {
    constructor(private info: ITaskInfo) {
    }
    getInfo() {
        this.info.name = this.info.name || 'test';
        return this.info;
    }
    setup(ctx: ITaskContext, gulp: Gulp) {
        let option = <IWebTaskOption>ctx.option;

        let tkn = ctx.subTaskName(this.getInfo());
        gulp.task(tkn, (callback: TaskCallback) => {
            let karmaConfigFile = option.karmaConfigFile || path.join(ctx.env.root, './karma.conf.js');
            if (!path.isAbsolute(karmaConfigFile)) {
                karmaConfigFile = path.join(ctx.env.root, karmaConfigFile);
            }
            let cfg = null;
            if (option.karmaConfig) {
                cfg = option.karmaConfig(ctx);
            }
            new Server(_.extend(cfg || {}, {
                configFile: karmaConfigFile
            }), (code: number) => {
                if (code === 1) {
                    console.log('Unit Test failures, exiting process');
                    callback(<any>'Unit Test Failures');
                } else {
                    console.log('Unit Tests passed');
                    callback();
                }
            }).start();
        });

        return tkn;
    }
}


@task({
    order: 1, // last order.
    oper: Operation.default | Operation.serve
})
export class StartService implements ITask {
    constructor(private info: ITaskInfo) {
    }
    getInfo() {
        this.info.name = this.info.name || 'serve';
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
