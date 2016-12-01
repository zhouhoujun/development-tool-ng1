import * as _ from 'lodash';
import * as chalk from 'chalk';
import { TaskCallback, Gulp } from 'gulp';
// import * as path from 'path';
import { Src, ITask, ITaskInfo, Operation, task, ITaskContext, RunWay } from 'development-core';
// import * as chalk from 'chalk';
import * as karma from 'karma';
import * as fs from 'fs';
import * as path from 'path';
const glob = require('glob');
const mkdirp = require('mkdirp');
// import * as mocha from 'gulp-mocha';
import { IWebTaskOption, KarmaJspmOption, KarmaJspm } from '../WebTaskOption';

@task({
    order: { value: 0.25, runWay: RunWay.parallel },
    oper: Operation.default | Operation.test
})
export class KarmaTest implements ITask {
    constructor(private info: ITaskInfo) {
    }
    getInfo() {
        this.info.name = this.info.name || 'web-test';
        return this.info;
    }
    setup(ctx: ITaskContext, gulp: Gulp) {
        let option = (<IWebTaskOption>ctx.option).karma || {};

        let tkn = ctx.subTaskName(this.getInfo());
        gulp.task(tkn, (callback: TaskCallback) => {
            let karmaConfigFile = option.configFile || path.join(ctx.env.root, './karma.conf.js');
            karmaConfigFile = ctx.toRootPath(karmaConfigFile);
            let cfg: karma.ConfigOptions = {};
            // get config.
            require(karmaConfigFile)({
                set(config) {
                    cfg = _.extend(cfg, config);
                }
            });
            if (option.config) {
                cfg = option.config(ctx);
            }

            cfg = <karma.ConfigOptions>_.extend(cfg, { singleRun: ctx.env.release || ctx.env.deploy || ctx.env.watch !== true });
            if (option.basePath) {
                cfg.basePath = ctx.toStr(option.basePath);
            } else if (_.isUndefined(cfg.basePath)) {
                cfg.basePath = ctx.getDist();
            }

            cfg.basePath = ctx.toRootPath(cfg.basePath);

            if (option.jspm) {
                cfg.files = cfg.files || [];
                cfg = this.initkarmaJspmPlugin(cfg, ctx);
            }

            let serve = new karma.Server(
                cfg,
                (code: number) => {
                    if (code === 1) {
                        console.log(chalk.red('Unit Test failures, exiting process'), ', code:', chalk.cyan(<any>code));
                        callback(<any>'Unit Test failures, exiting process');
                    } else {
                        console.log('Unit Tests passed', ', code:', chalk.cyan(<any>code));
                        callback();
                    }
                });

            serve.start();
        });

        return tkn;
    }

    getRelativePaths(ctx: ITaskContext, rootpath: string, prefix = '') {
        let paths: any = {};
        let bundleDest = ctx.getDist();
        let dir = fs.readdirSync(bundleDest);
        _.each(dir, (d: string) => {

            let sf = path.join(bundleDest, d);
            let f = fs.lstatSync(sf);
            if (f.isDirectory()) {
                let p = d + '/**/*';
                paths[p] = prefix + ctx.toUrl(rootpath, path.join(bundleDest, p));
            }
        });
        // let jpk = <string>option.jspmPackages;
        // let jp = path.basename(jpk) + '/*';
        // paths[jp] = self.toUrl(rootpath, path.join(jpk, jp));
        console.log('paths: ', paths);
        return paths;
    }


    initkarmaJspmPlugin(cfg: karma.ConfigOptions, ctx: ITaskContext): karma.ConfigOptions {
        let option = (<IWebTaskOption>ctx.option).karma || {};
        let pkg = ctx.getPackage();

        let karmajspm: KarmaJspmOption;
        if (_.isFunction(option.jspm)) {
            karmajspm = option.jspm(ctx);
        } else if (_.isBoolean(karma)) {
            karmajspm = {};
        } else {
            karmajspm = option.jspm;
        }
        let jspmcfg: KarmaJspm = cfg['jspm'] || {};

        let adapterfile = ctx.toUrl(this.checkAdapter(karmajspm, ctx));

        if (karmajspm.packages) {
            jspmcfg.packages = ctx.toRootPath(ctx.toStr(karmajspm.packages));
        } else {
            if (!jspmcfg.packages && pkg.jspm && pkg.jspm.directories) {
                jspmcfg.packages = ctx.toRootPath(pkg.jspm.directories.packages);
            } else if (jspmcfg.packages) {
                jspmcfg.packages = ctx.toRootPath(jspmcfg.packages);
            }
        }
        if (karmajspm.config) {
            jspmcfg.config = ctx.toDistSrc(ctx.toSrc(karmajspm.config));
        } else {
            if (!jspmcfg.config && pkg.jspm) {
                jspmcfg.config = ctx.toRootPath(pkg.jspm.configFile);
            } else if (jspmcfg.config) {
                jspmcfg.config = ctx.toDistSrc(jspmcfg.config);
            }
        }

        jspmcfg.config = _.isString(jspmcfg.config) ? ctx.toUrl(jspmcfg.config) : _.map(jspmcfg.config, it => ctx.toUrl(it));

        jspmcfg.baseURL = ctx.toStr(karmajspm.baseURL || jspmcfg.baseURL || '');
        if (!_.isUndefined(karmajspm.cachePackages)) {
            jspmcfg.cachePackages = karmajspm.cachePackages;
        }

        let relpkg = path.relative(cfg.basePath, jspmcfg.packages);
        let resetBase = false;
        if (/^\.\./.test(relpkg)) {
            resetBase = true;
            cfg.basePath = ctx.getRootPath();
            jspmcfg.paths = this.getRelativePaths(ctx, cfg.basePath, 'base/');
            // jspmcfg.paths = jspmcfg.paths || {};
            jspmcfg.baseURL = ctx.toUrl(ctx.getRootPath(), ctx.getDist());
            let rlpk = ctx.toUrl(ctx.getRootPath(), jspmcfg.packages) + '/**/*';
            jspmcfg.paths[rlpk] = 'base/' + rlpk;
            cfg.proxies = _.extend(cfg.proxies, jspmcfg.paths);
        }

        jspmcfg.loadFiles = jspmcfg.loadFiles || [];
        jspmcfg.serveFiles = jspmcfg.serveFiles || [];

        if (karmajspm.loadFiles) {
            jspmcfg.loadFiles = jspmcfg.loadFiles.concat(_.isFunction(karmajspm.loadFiles) ? karmajspm.loadFiles(ctx) : karmajspm.loadFiles);
        }
        if (karmajspm.serveFiles) {
            jspmcfg.serveFiles = jspmcfg.serveFiles.concat(_.isFunction(karmajspm.serveFiles) ? karmajspm.serveFiles(ctx) : karmajspm.serveFiles);
        }

        cfg.plugins = _.filter(cfg.plugins || [], it => it !== 'karma-jspm');
        cfg.frameworks = _.filter(cfg.frameworks || [], it => it !== 'jspm');
        // clean.

        cfg.plugins = cfg.plugins.concat(_.map(cfg.frameworks, it => 'karma-' + it.toLowerCase()));
        cfg.plugins = cfg.plugins.concat(_.map(cfg.reporters, it => {
            let packname = 'karma-' + it.toLowerCase() + '-reporter'
            if (pkg.dependencies[packname] || pkg.devDependencies[packname]) {
                return packname;
            }
            return 'karma-' + it;
        }));
        cfg.plugins = cfg.plugins.concat(_.map(cfg.browsers, it => {
            let packname = 'karma-' + it.toLowerCase() + '-launcher';
            if (pkg.dependencies[packname] || pkg.devDependencies[packname]) {
                return packname;
            }
            return 'karma-' + it;
        }));
        cfg.plugins = _.uniq(cfg.plugins);



        let initJspm: any = (files: (karma.FilePattern | string)[], basePath: string, jspm: KarmaJspm, client, emitter) => {
            console.log('--------------------init karma jspm---------------------\n', 'base path:', chalk.cyan(basePath));
            jspm = jspm || {}

            jspm = _.extend(jspm || {}, jspmcfg);

            client.jspm = client.jspm || {};
            if (jspm.paths !== undefined && typeof jspm.paths === 'object') {
                client.jspm.paths = jspm.paths;
            }
            if (jspm.meta !== undefined && typeof jspm.meta === 'object') {
                client.jspm.meta = jspm.meta;
            }

            // Pass on options to client
            client.jspm.useBundles = jspm.useBundles;
            client.jspm.stripExtension = jspm.stripExtension;

            let baseURL = jspm.baseURL;
            client.jspm.baseURL = baseURL || '';

            console.log('base URL:', chalk.cyan(baseURL));
            let fileBasePath = ctx.toUrl(resetBase ? ctx.getDist() : path.join(basePath, baseURL));
            console.log('fileBasePath', fileBasePath);

            let packagesPath = ctx.toUrl(jspm.packages);
            let browserPath = ctx.toUrl(ctx.toRootPath(ctx.toStr(jspm.browser || '')));
            let configPaths: string[] = Array.isArray(jspm.config) ? <string[]>jspm.config : [<string>jspm.config];
            // Add SystemJS loader and jspm config


            Array.prototype.unshift.apply(files,
                configPaths.map((configPath) => {
                    return createPattern(configPath)
                })
            );

            // Needed for JSPM 0.17 beta
            if (jspm.browser) {
                files.unshift(createPattern(browserPath));
            }

            files.unshift(createPattern(adapterfile));
            files.unshift(createPattern(ctx.toUrl(getPackageFilePath(packagesPath, 'system-polyfills.src'))));
            files.unshift(createPattern(ctx.toUrl(getPackageFilePath(packagesPath, 'system.src'))));

            function addExpandedFiles() {
                client.jspm.expandedFiles = _.flatten(_.map(jspm.loadFiles, file => {
                    let flname = path.join(fileBasePath, _.isString(file) ? file : file.pattern);
                    files.push(createServedPattern(ctx.toUrl(flname), _.isString(file) ? null : file));
                    return _.map(glob.sync(flname), (fm: string) => ctx.toUrl(fileBasePath, fm));
                }));

                console.log('expandedFiles:', client.jspm.expandedFiles);
            }
            addExpandedFiles();

            emitter.on('file_list_modified', addExpandedFiles);

            // Add served files to files array
            _.each(jspm.serveFiles, file => {
                files.push(createServedPattern(ctx.toUrl(path.join(fileBasePath, _.isString(file) ? file : file.pattern))));
            });

            // Allow Karma to serve all files within jspm_packages.
            // This allows jspm/SystemJS to load them
            var jspmPattern = createServedPattern(
                ctx.toUrl(path.join(packagesPath, '!(system-polyfills.src.js|system.src.js)/**')), { nocache: jspm.cachePackages !== true }
            );
            jspmPattern.watched = false;
            files.push(jspmPattern);

            console.log('------------------------complete jspm pattern:\n', files);
        };
        initJspm.$inject = ['config.files', 'config.basePath', 'config.jspm', 'config.client', 'emitter'];

        cfg.frameworks.unshift('jspmdev');
        cfg.plugins.unshift({
            'framework:jspmdev': ['factory', initJspm]
        });

        return cfg;
    }


    getDefaultAdapter() {
        return {
            name: 'adapter',
            template: `
(function(karma, System) {
    if (!System) {
        throw new Error('SystemJS was not found. Please make sure you have ' +
            'initialized jspm via installing a dependency with jspm, ' +
            'or by running "jspm dl-loader".');
    }


    System.config({ baseURL: karma.config.jspm.baseURL?  'base/'+karma.config.jspm.baseURL : 'base' });
    

    var stripExtension = typeof karma.config.jspm.stripExtension === 'boolean' ? karma.config.jspm.stripExtension : true;

    // Prevent immediately starting tests.
    karma.loaded = function() {

        if (karma.config.jspm.paths !== undefined &&
            typeof karma.config.jspm.paths === 'object') {

            System.config({
                paths: karma.config.jspm.paths
            });
        }

        if (karma.config.jspm.meta !== undefined &&
            typeof karma.config.jspm.meta === 'object') {
            System.config({
                meta: karma.config.jspm.meta
            });
        }

        // Exclude bundle configurations if useBundles option is not specified
        if (!karma.config.jspm.useBundles) {
            System.bundles = [];
        }

        // Load everything specified in loadFiles in the specified order
        var promiseChain = Promise.resolve();
        for (var i = 0; i < karma.config.jspm.expandedFiles.length; i++) {
            promiseChain = promiseChain.then((function(moduleName) {
                return function() {
                    return System['import'](moduleName);
                };
            })(extractModuleName(karma.config.jspm.expandedFiles[i])));
        }

        promiseChain.then(function() {
            karma.start();
        }, function(e) {
            karma.error(e.name + ': ' + e.message);
        });
    };

    function extractModuleName(fileName) {
        if (stripExtension) {
            return fileName.replace(/\.js$/, '');
        }
        return fileName;
    }
})(window.__karma__, window.System);`
        };
    }


    checkAdapter(karmajspm: KarmaJspmOption, ctx: ITaskContext): string {

        let templ = karmajspm.karmaloader;
        let defaultTempl = this.getDefaultAdapter();
        if (!templ) {
            templ = defaultTempl;
        } else {
            if (templ.name === defaultTempl.name) {
                console.log(chalk.red('can not rewrite default adapter named: "adapter".'));
                templ = defaultTempl;
            }
        }

        let adapterfile = path.join(__dirname, './adapters', templ.name);
        if (!/.js$/.test(adapterfile)) {
            adapterfile = adapterfile + '.js';
        }
        mkdirp.sync(path.dirname(adapterfile));
        if (!fs.existsSync(adapterfile)) {
            fs.writeFileSync(adapterfile, templ.template, 'utf8')
        }

        return adapterfile;
    }
}

function getPackageFilePath(packagesPath: string, fileName: string): string {
    let fm = path.join(packagesPath, fileName + '@*.js');
    var exists = glob.sync(fm);
    if (exists && exists.length !== 0) {
        return fm;
    } else {
        return path.join(packagesPath, fileName + '.js');
    }
}

const createPattern = function (path: string) {
    return { pattern: path, included: true, served: true, watched: false };
};

const createServedPattern = function (pathstr: string, file?) {
    return {
        pattern: pathstr,
        included: file && 'included' in file ? file.included : false,
        served: file && 'served' in file ? file.served : true,
        nocache: file && 'nocache' in file ? file.nocache : false,
        watched: file && 'watched' in file ? file.watched : true
    };
};
