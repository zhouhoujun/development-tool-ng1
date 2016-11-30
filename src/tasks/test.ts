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
        let option = <IWebTaskOption>ctx.option;

        let tkn = ctx.subTaskName(this.getInfo());
        gulp.task(tkn, (callback: TaskCallback) => {
            let karmaConfigFile = option.karmaConfigFile || path.join(ctx.env.root, './karma.conf.js');
            karmaConfigFile = ctx.toRootPath(karmaConfigFile);
            let cfg: karma.ConfigOptions = null;
            if (option.karmaConfig) {
                cfg = option.karmaConfig(ctx);
            }

            cfg = <karma.ConfigOptions>_.extend(cfg || { singleRun: ctx.env.release || ctx.env.deploy || ctx.env.watch !== true }, {
                configFile: karmaConfigFile
            });
            if (option.karmaBasePath) {
                cfg.basePath = ctx.toStr(option.karmaBasePath);
            } else if (_.isUndefined(cfg.basePath)) {
                cfg.basePath = ctx.getDist();
            }

            cfg.basePath = ctx.toRootPath(cfg.basePath);

            if (option.karmaJspm) {
                cfg.files = cfg.files || [];
                require(karmaConfigFile)({
                    set(config) {
                        cfg = _.extend(cfg, config);
                    }
                });
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

            if (option.karmaJspm) {
                serve.on('file_list_modified', () => {

                });
            }
            serve.start();
        });

        return tkn;
    }

    initkarmaJspmPlugin(cfg: karma.ConfigOptions, ctx: ITaskContext): karma.ConfigOptions {
        let option = <IWebTaskOption>ctx.option;
        let pkg = ctx.getPackage();

        let karmajspm = _.isFunction(option.karmaJspm) ? option.karmaJspm(ctx) : option.karmaJspm;
        let adapterfile = ctx.toUrl(this.checkAdapter(karmajspm, ctx));

        let initJspm: any = (files: (karma.FilePattern | string)[], basePath: string, jspm: KarmaJspm, client, emitter) => {
            let dist = ctx.getDist();
            basePath = ctx.toDistPath(path.relative(dist, basePath));
            console.log('--------------------init karma jspm---------------------\n', 'base path:', chalk.cyan(basePath));

            jspm = <KarmaJspm>jspm || {};
            if (karmajspm.config) {
                jspm.config = ctx.toSrc(karmajspm.config);
            }
            if (!jspm.config && pkg.jspm) {
                jspm.config = ctx.toRootPath(pkg.jspm.configFile);
            } else {
                jspm.config = _.isString(jspm.config) ? path.join(basePath, jspm.config) : _.map(jspm.config, it => path.join(it, <string>it));
            }

            jspm.config = _.isString(jspm.config) ? ctx.toUrl(jspm.config) : _.map(jspm.config, it => ctx.toUrl(<string>it));

            jspm.loadFiles = jspm.loadFiles || [];
            jspm.serveFiles = jspm.serveFiles || [];
            if (karmajspm.loadFiles) {
                jspm.loadFiles.concat(_.isFunction(karmajspm.loadFiles) ? karmajspm.loadFiles(ctx) : karmajspm.loadFiles);
            }
            if (karmajspm.serveFiles) {
                jspm.serveFiles.concat(_.isFunction(karmajspm.serveFiles) ? karmajspm.serveFiles(ctx) : karmajspm.serveFiles);
            }

            if (karmajspm.packages) {
                jspm.packages = ctx.toStr(jspm.packages || karmajspm.packages);
            }
            if (!jspm.packages && pkg.jspm && pkg.jspm.directories) {
                jspm.packages = ctx.toRootPath(pkg.jspm.directories.packages);
            } else {
                jspm.packages = path.join(basePath, jspm.packages);
            }

            jspm.cachePackages = _.isUndefined(karmajspm.cachePackages) ? jspm.cachePackages : jspm.cachePackages;


            client.jspm = client.jspm || {};
            if (jspm.paths !== undefined && typeof jspm.paths === 'object') {
                client.jspm.paths = jspm.paths;
            }
            if (jspm.meta !== undefined && typeof jspm.meta === 'object') {
                client.jspm.meta = jspm.meta;
            }

            // Pass on options to client
            client.jspm.useBundles = _.isUndefined(karmajspm.useBundles) ? jspm.useBundles : karmajspm.useBundles;
            client.jspm.stripExtension = _.isUndefined(karmajspm.stripExtension) ? jspm.stripExtension : karmajspm.stripExtension;

            let baseURL = ctx.toStr(karmajspm.baseURL || jspm.baseURL);
            let fileBasePath = ctx.toUrl(path.join(basePath, baseURL));
            client.jspm.baseURL = fileBasePath;

            console.log('fileBasePath', fileBasePath);
            console.log('base URL:', chalk.cyan(fileBasePath));

            let packagesPath = ctx.toUrl(jspm.packages);
            let browserPath = ctx.toUrl(ctx.toRootPath(ctx.toStr(karmajspm.browser || jspm.browser || '')));
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
                    files.push(createServedPattern(ctx.toUrl(path.join(fileBasePath, _.isString(file) ? file : file.pattern)), _.isString(file) ? null : file));
                    return expandGlob(file, basePath);
                }));
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
                packagesPath + '!(system-polyfills.src.js|system.src.js)/**', { nocache: jspm.cachePackages !== true }
            );
            jspmPattern.watched = false;
            files.push(jspmPattern);

            console.log('------------------------complete jspm pattern:\n', files);
        };
        initJspm.$inject = ['config.files', 'config.basePath', 'config.jspm', 'config.client', 'emitter'];

        cfg.plugins = cfg.plugins || [];
        cfg.frameworks = cfg.frameworks || [];
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

        if (cfg.frameworks.indexOf('jspm') > 0) {
            cfg.frameworks.splice(cfg.frameworks.indexOf('jspm'), 1);
        }
        cfg.frameworks.unshift('jspm');

        if (cfg.plugins.indexOf('karma-jspm') > 0) {
            cfg.plugins.splice(cfg.plugins.indexOf('karma-jspm'), 1);
        }
        cfg.plugins.unshift({
            'framework:jspm': ['factory', initJspm]
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

    System.config({ baseURL: karma.config.jspm.baseURL || './' });

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

function expandGlob(file, cwd: string) {
    return glob.sync(file.pattern || file, { cwd: cwd });
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
