import * as _ from 'lodash';
import * as chalk from 'chalk';
import { TaskCallback, Gulp } from 'gulp';
import { Src, ITask, ITaskInfo, Operation, task, ITaskContext, RunWay } from 'development-core';
import { IWebTaskOption } from '../WebTaskOption';
import * as browserSync from 'browser-sync';
import * as path from 'path';

@task({
    order: (total, ctx) => ctx.env.test ? { value: 2 / total, runWay: RunWay.parallel } : 1, // last order.
    oper: Operation.default | Operation.serve
})
export class StartServer implements ITask {
    constructor(private info: ITaskInfo) {
    }
    getInfo() {
        this.info.name = this.info.name || 'web-serve';
        return this.info;
    }
    setup(ctx: ITaskContext, gulp: Gulp) {
        let option = (<IWebTaskOption>ctx.option).browsersync || {};
        let files: string[] = null;
        if (option.files) {
            files = _.isFunction(option.files) ? option.files(ctx) : option.files;
        }
        files = files || [];
        let pkg = ctx.getPackage();
        let packagePath = '';
        if (option.jspm && option.jspm.packages) {
            packagePath = ctx.toRootPath(ctx.toStr(option.jspm.packages));
        } else {
            if (pkg.jspm && pkg.jspm && pkg.jspm.directories) {
                packagePath = ctx.toRootPath(pkg.jspm.directories.packages);
            }
        }

        if (packagePath) {
            files.push(`${packagePath}/**/*`)
        }

        let dist = ctx.getDist(this.getInfo());
        let baseDir: Src = null;
        if (option.baseDir) {
            baseDir = ctx.toRootSrc(_.isFunction(option.baseDir) ? option.baseDir(ctx) : option.baseDir);
        } else {
            baseDir = dist;
        }
        baseDir = _.isArray(baseDir) ? baseDir : [baseDir];
        baseDir.push(path.dirname(packagePath));
        let relpkg = path.relative(_.first(baseDir), packagePath);
        if (/^\.\./.test(relpkg)) {
            baseDir.push(ctx.getRootPath());
            baseDir = _.uniq(baseDir);
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
