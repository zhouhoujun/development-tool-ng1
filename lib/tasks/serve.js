"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var development_core_1 = require("development-core");
var browserSync = require("browser-sync");
var path = require("path");
var StartServer = (function () {
    function StartServer(info) {
        this.info = info;
    }
    StartServer.prototype.getInfo = function () {
        this.info.name = this.info.name || 'web-serve';
        return this.info;
    };
    StartServer.prototype.setup = function (ctx, gulp) {
        var option = ctx.option.browsersync || {};
        var watchOptions = option.watchOptions || { ignoreInitial: true, ignored: ['*.txt', '*.map', '*.d.ts'] };
        var files = [];
        if (option.files) {
            var rf = ctx.to(option.files);
            files = _.isArray(rf) ? rf : [rf];
        }
        if (option.filesByCtx) {
            var dfs = ctx.to(option.filesByCtx);
            if (_.isArray(dfs)) {
                files = files.concat(dfs);
            }
            else {
                files.push(dfs);
            }
        }
        var pkg = ctx.getPackage();
        var rootpath = ctx.getRootPath();
        var packagePath = '';
        if (option.jspm && option.jspm.packages) {
            packagePath = ctx.toRootPath(ctx.toStr(option.jspm.packages));
        }
        else {
            if (pkg.jspm && pkg.jspm && pkg.jspm.directories) {
                packagePath = ctx.toRootPath(pkg.jspm.directories.packages);
            }
            else {
                packagePath = ctx.toRootPath('./node_modules');
            }
        }
        var hascfg = false;
        var pkgname = path.basename(packagePath);
        watchOptions.ignored = _.isArray(watchOptions.ignored) ? watchOptions.ignored : [watchOptions.ignored];
        watchOptions.ignored.push(pkgname + '/**');
        var pkgreg = new RegExp('/^' + pkgname + '\//', 'gi');
        files = _.map(files || [], function (it) {
            if (_.isString(it)) {
                if (!hascfg) {
                    hascfg = pkgreg.test(it);
                }
                return {
                    match: it,
                    options: watchOptions
                };
            }
            else {
                return it;
            }
        });
        if (!hascfg && packagePath) {
            // files.push(`${path.relative(rootpath, packagePath)}/**`)
            files.push({
                match: path.relative(rootpath, packagePath) + "/**",
                options: watchOptions
            });
        }
        var dist = ctx.getDist(this.getInfo());
        var baseDir = null;
        if (option.baseDir) {
            baseDir = ctx.toRootSrc(_.isFunction(option.baseDir) ? option.baseDir(ctx) : option.baseDir);
        }
        else {
            baseDir = dist;
        }
        baseDir = _.isArray(baseDir) ? baseDir : [baseDir];
        baseDir.push(path.dirname(packagePath));
        var relpkg = path.relative(_.first(baseDir), packagePath);
        if (/^\.\./.test(relpkg)) {
            baseDir.push(rootpath);
        }
        baseDir = _.uniq(_.map(baseDir, function (dr) {
            if (path.isAbsolute(dr)) {
                return path.relative(rootpath, dr) || '.';
            }
            else {
                return dr;
            }
        }));
        files.push({
            match: path.relative(rootpath, dist) + "/**",
            options: watchOptions
        });
        var browsersyncOption = _.extend({
            open: true,
            port: process.env.PORT || 3000
        }, _.omit(option, ['files', 'baseDir', 'jspm']), {
            watchOptions: watchOptions,
            server: {
                baseDir: baseDir
            },
            files: files
        });
        var tkn = ctx.subTaskName(this.info);
        gulp.task(tkn, function (callback) {
            browserSync(browsersyncOption, function (err, bs) {
                if (err) {
                    callback(err);
                }
            });
        });
        return tkn;
    };
    return StartServer;
}());
StartServer = __decorate([
    development_core_1.task({
        // order: (total, ctx) => ctx.env.test ? { value: 2 / total, runWay: RunWay.parallel } : 1, // last order.
        oper: development_core_1.Operation.default | development_core_1.Operation.serve
    }),
    __metadata("design:paramtypes", [Object])
], StartServer);
exports.StartServer = StartServer;

//# sourceMappingURL=../sourcemaps/tasks/serve.js.map
