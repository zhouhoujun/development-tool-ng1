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
        let watchOptions = option.watchOptions || { ignoreInitial: true, ignored: ['*.txt', '*.map', '*.d.ts'] };
        let files: any[] = [];
        if (option.files) {
            let rf = ctx.to(option.files);
            files = _.isArray(rf) ? rf : [rf];
        }
        if (option.filesByCtx) {
            let dfs = ctx.to(option.filesByCtx);
            if (_.isArray(dfs)) {
                files = files.concat(dfs);
            } else {
                files.push(dfs);
            }
        }

        let pkg = ctx.getPackage();
        let rootpath = ctx.getRootPath();
        let packagePath = '';
        if (option.jspm && option.jspm.packages) {
            packagePath = ctx.toRootPath(ctx.toStr(option.jspm.packages));
        } else {
            if (pkg.jspm && pkg.jspm && pkg.jspm.directories) {
                packagePath = ctx.toRootPath(pkg.jspm.directories.packages);
            } else {
                packagePath = ctx.toRootPath('./node_modules');
            }
        }


        let hascfg = false;
        let pkgname = path.basename(packagePath);
        watchOptions.ignored = _.isArray(watchOptions.ignored) ? watchOptions.ignored : [watchOptions.ignored];
        watchOptions.ignored.push(pkgname + '/**');
        let pkgreg = new RegExp('/^' + pkgname + '\//', 'gi');
        files = _.map(files || [], it => {
            if (_.isString(it)) {
                if (!hascfg) {
                    hascfg = pkgreg.test(it);
                }
                return {
                    match: it,
                    options: watchOptions
                }
            } else {
                return it;
            }
        });

        if (!hascfg && packagePath) {
            // files.push(`${path.relative(rootpath, packagePath)}/**`)
            files.push({
                match: `${path.relative(rootpath, packagePath)}/**`,
                options: watchOptions
            });
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
            baseDir.push(rootpath);
        }

        baseDir = _.uniq(_.map(baseDir, dr => {
            if (path.isAbsolute(dr)) {
                return path.relative(rootpath, dr) || '.';
            } else {
                return dr;
            }
        }));


        files.push({
            match: `${path.relative(rootpath, dist)}/**`,
            options: watchOptions
        });

        let browsersyncOption = <browserSync.Options>_.extend(
            {
                open: true,
                port: process.env.PORT || 3000
            },
            _.omit(option, ['files', 'baseDir', 'jspm']),
            {
                watchOptions: watchOptions,
                server: {
                    baseDir: baseDir
                },
                files: files
            });

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
