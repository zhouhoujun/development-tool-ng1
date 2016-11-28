
import * as _ from 'lodash';
import * as chalk from 'chalk';
import { TaskCallback, Gulp } from 'gulp';
// import * as path from 'path';
import { Src, ITask, ITaskInfo, Operation, task, ITaskContext, RunWay } from 'development-core';
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
        gulp.task(tkn, () => {
            return del(ctx.getSrc(info));
        });

        return tkn;
    }
}


@task({
    order: { value: 0.25, runWay: RunWay.parallel }, // last order.
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
            new Server(_.extend(cfg || { basePath: _.isUndefined(option.karmaBasePath) ? ctx.getDist() : ctx.toStr(option.karmaBasePath), singleRun: ctx.env.watch !== true }, {
                configFile: karmaConfigFile,
            }), (code: number) => {
                if (code === 1) {
                    console.log(chalk.red('Unit Test failures, exiting process'), ', code:', chalk.cyan(<any>code));
                    callback(<any>'Unit Test failures, exiting process');
                } else {
                    console.log('Unit Tests passed', ', code:', chalk.cyan(<any>code));
                    callback();
                }
            }).start();
        });

        return tkn;
    }
}

@task({
    order: { value: 0.25, runWay: RunWay.parallel }, // last order.
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
            new Server(_.extend(cfg || { basePath: ctx.getDist(), singleRun: true }, {
                configFile: karmaConfigFile
            })
                , (code: number) => {
                    if (code === 1) {
                        console.log(chalk.red('Unit Test failures, exiting process'), ', code:', chalk.cyan(<any>code));
                        callback(<any>'Unit Test failures, exiting process');
                    } else {
                        console.log('Unit Tests passed', ', code:', chalk.cyan(<any>code));
                        callback();
                    }
                }).start();
        });

        return tkn;
    }
}


@task({
    order: (total, ctx) => ctx.env.test ? { value: 0.25, runWay: RunWay.parallel } : 1, // last order.
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

        let files: string[] = null;
        if (option.serverFiles) {
            files = _.isFunction(option.serverFiles) ? option.serverFiles(ctx) : option.serverFiles;
        }
        files = files || [];
        let dist = ctx.getDist(this.getInfo());
        let baseDir: Src = null;
        if (option.serverBaseDir) {
            baseDir = _.isFunction(option.serverBaseDir) ? option.serverBaseDir(ctx) : option.serverBaseDir;
        } else {
            baseDir = dist;
        }
        files.push(`${dist}/**/*`);

        let browsersyncOption = {
            server: {
                baseDir: baseDir
            },
            open: true,
            port: process.env.PORT || 3000,
            files: files
        };

        if (option.browsersync) {
            browsersyncOption = _.extend(browsersyncOption, _.isFunction(option.browsersync) ? option.browsersync(ctx, browsersyncOption) : option.browsersync);
        }
        let tkn = ctx.subTaskName(this.info);
        gulp.task(tkn, (callback: TaskCallback) => {
            browserSync(browsersyncOption, (err, bs) => {
                if (err) {
                    callback(<any>err);
                }
            });
        });

        return tkn;
    }
}
