import * as _ from 'lodash';
import * as chalk from 'chalk';
import { TaskCallback, Gulp } from 'gulp';
// import * as path from 'path';
import { Src, ITask, ITaskInfo, Operation, task, ITaskContext } from 'development-core';
// import * as chalk from 'chalk';
import * as karma from 'karma';
import * as fs from 'fs';
import * as path from 'path';
const glob = require('glob');
const mkdirp = require('mkdirp');
import * as url from 'url';
import { IWebTaskOption, KarmaSystemjsOption, KarmaSystemjs } from '../WebTaskOption';

@task({
    // order: total => { return { value: 2 / total, runWay: RunWay.parallel } },
    oper: Operation.default | Operation.test
})
export class KarmaTest implements ITask {
    constructor(private info: ITaskInfo) {
    }
    getInfo() {
        this.info.name = this.info.name || 'karma';
        return this.info;
    }
    setup(ctx: ITaskContext, gulp: Gulp) {
        let option = (<IWebTaskOption>ctx.option).karma || {};
        // console.log('web test:----------------------\n', ctx.getRootPath());
        let tkn = ctx.subTaskName(this.getInfo());
        gulp.task(tkn, (callback: TaskCallback) => {
            let karmaConfigFile = option.configFile || path.join(ctx.getRootPath(), './karma.conf.js');
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

            cfg = <karma.ConfigOptions>_.extend(cfg, { singleRun: ((ctx.oper & Operation.release) > 0) || ((ctx.oper & Operation.watch) === 0) });
            if (option.basePath) {
                cfg.basePath = ctx.toStr(option.basePath);
            } else if (_.isUndefined(cfg.basePath)) {
                cfg.basePath = ctx.getDist();
            }

            cfg.basePath = ctx.toRootPath(cfg.basePath);

            if (!option.systemjs && option['jspm']) {
                option.systemjs = option['jspm']
            }
            // console.log('before init option:----------------------------\n', ctx.option);
            if (option.systemjs) {
                cfg.files = cfg.files || [];
                cfg = this.initkarmaSystemjsPlugin(cfg, ctx);
            }

            // console.log('cfg:----------------------------\n', cfg);

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
                let p = '/' + d + '/*';
                paths[p] = prefix + ctx.toUrl(rootpath, path.join(bundleDest, p));
            }
        });
        let p = '*'
        paths[p] = prefix + ctx.toUrl(rootpath, path.join(bundleDest, p));
        // let jpk = <string>option.systemjsPackages;
        // let jp = path.basename(jpk) + '/*';
        // paths[jp] = self.toUrl(rootpath, path.join(jpk, jp));

        return paths;
    }


    initkarmaSystemjsPlugin(cfg: karma.ConfigOptions, ctx: ITaskContext): karma.ConfigOptions {
        let option = (<IWebTaskOption>ctx.option).karma || {};
        let pkg = ctx.getPackage();

        let karmaSystemjs: KarmaSystemjsOption;
        if (_.isFunction(option.systemjs)) {
            karmaSystemjs = option.systemjs(ctx);
        } else if (_.isBoolean(karma)) {
            karmaSystemjs = {};
        } else {
            karmaSystemjs = option.systemjs;
        }
        let syscfg: KarmaSystemjs = cfg['systemjs'] || cfg['jspm'] || {};

        let adapterfile = ctx.toUrl(this.checkAdapter(karmaSystemjs, ctx));

        if (karmaSystemjs.packages) {
            syscfg.packages = ctx.toRootPath(ctx.toStr(karmaSystemjs.packages));
        } else {
            if (!syscfg.packages && pkg.systemjs && pkg.systemjs.directories) {
                syscfg.packages = ctx.toRootPath(pkg.systemjs.directories.packages);
            } else if (syscfg.packages) {
                syscfg.packages = ctx.toRootPath(syscfg.packages);
            }
        }
        if (karmaSystemjs.config) {
            syscfg.config = ctx.toDistSrc(ctx.toSrc(karmaSystemjs.config));
        } else {
            if (!syscfg.config && pkg.systemjs) {
                syscfg.config = ctx.toRootPath(pkg.systemjs.configFile);
            } else if (syscfg.config) {
                syscfg.config = ctx.toDistSrc(syscfg.config);
            }
        }

        syscfg.config = _.isString(syscfg.config) ? ctx.toUrl(syscfg.config) : _.map(syscfg.config, it => ctx.toUrl(it));

        syscfg.baseURL = ctx.toStr(karmaSystemjs.baseURL || syscfg.baseURL || '');
        if (!_.isUndefined(karmaSystemjs.cachePackages)) {
            syscfg.cachePackages = karmaSystemjs.cachePackages;
        }

        console.log('packages:------------------------\n', syscfg.packages);

        let relpkg = ctx.toUrl(cfg.basePath, syscfg.packages);
        let resetBase = false;
        if (/^\.\./.test(relpkg)) {
            resetBase = true;
            let root = cfg.basePath = ctx.getRootPath();
            syscfg.paths = this.getRelativePaths(ctx, cfg.basePath); // , 'base/');
            let rlpk = ctx.toUrl(root, syscfg.packages) + '/*';
            let systempk = path.basename(syscfg.packages) + '/*';
            syscfg.paths['/' + systempk] = 'base/' + rlpk;


            let res: Src = ctx.to(karmaSystemjs.resource) || ['public', 'asserts'];
            let relpth = ctx.toUrl(root, ctx.getDist());
            cfg.proxies = cfg.proxies || {};
            cfg.files = cfg.files || [];
            _.each(_.isString(res) ? [res] : res, r => {
                cfg.files.push({ pattern: ctx.toUrl(root, ctx.toDistPath(r)) + '/**', included: false });

                let abr = /^\//.test(r) ? ('base' + r) : ('base/' + r);
                cfg.proxies[abr] = url.resolve(relpth, r);
            });

            console.log('paths: ', syscfg.paths);

            cfg.proxies = _.extend(cfg.proxies, syscfg.paths);
            cfg.proxies[path.basename(syscfg.packages)] = ctx.toUrl(root, syscfg.packages);
            console.log('proxies: ', cfg.proxies);
        }

        syscfg.loadFiles = syscfg.loadFiles || [];
        syscfg.serveFiles = syscfg.serveFiles || [];

        if (karmaSystemjs.loadFiles) {
            syscfg.loadFiles = syscfg.loadFiles.concat(_.isFunction(karmaSystemjs.loadFiles) ? karmaSystemjs.loadFiles(ctx) : karmaSystemjs.loadFiles);
        }
        if (karmaSystemjs.serveFiles) {
            syscfg.serveFiles = syscfg.serveFiles.concat(_.isFunction(karmaSystemjs.serveFiles) ? karmaSystemjs.serveFiles(ctx) : karmaSystemjs.serveFiles);
        }

        cfg.plugins = _.filter(cfg.plugins || [], it => it !== 'karma-systemjs');
        cfg.frameworks = _.filter(cfg.frameworks || [], it => it !== 'systemjs');
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



        let initSystemjs: any = (files: (karma.FilePattern | string)[], basePath: string, systemjs: KarmaSystemjs, client, emitter) => {
            console.log('--------------------init karma systemjs---------------------\n', 'base path:', chalk.cyan(basePath));
            systemjs = systemjs || {}

            systemjs = _.extend(systemjs || {}, syscfg);

            client.systemjs = client.systemjs || {};
            if (systemjs.paths !== undefined && typeof systemjs.paths === 'object') {
                client.systemjs.paths = systemjs.paths;
            }
            if (systemjs.meta !== undefined && typeof systemjs.meta === 'object') {
                client.systemjs.meta = systemjs.meta;
            }
            // Pass on options to client
            client.systemjs.useBundles = systemjs.useBundles;
            client.systemjs.stripExtension = systemjs.stripExtension;

            let baseURL = systemjs.baseURL;
            client.systemjs.baseURL = baseURL || '';

            console.log('base URL:', chalk.cyan(baseURL));
            let fileBasePath = ctx.toUrl(resetBase ? ctx.getDist() : path.join(basePath, baseURL));
            console.log('fileBasePath', fileBasePath);

            let packagesPath = ctx.toUrl(systemjs.packages);
            let browserPath = ctx.toUrl(ctx.toRootPath(ctx.toStr(systemjs.browser || '')));
            let configPaths: string[] = Array.isArray(systemjs.config) ? <string[]>systemjs.config : [<string>systemjs.config];
            // Add SystemJS loader and systemjs config


            Array.prototype.unshift.apply(files,
                configPaths.map((configPath) => {
                    return createPattern(configPath)
                })
            );

            // Needed for JSPM 0.17 beta
            if (systemjs.browser) {
                files.unshift(createPattern(browserPath));
            }

            files.unshift(createPattern(adapterfile));
            let sysjs = karmaSystemjs.systemjs ? ctx.toSrc(karmaSystemjs.systemjs) : ['system-polyfills', 'system'];
            _.each(_.isArray(sysjs) ? sysjs : [sysjs], sf => {
                files.unshift(createPattern(ctx.toUrl(getPackageFilePath(packagesPath, sf))));
            });

            function addExpandedFiles() {
                client.systemjs.expandedFiles = _.flatten(_.map(systemjs.loadFiles, file => {
                    let flname = path.join(fileBasePath, _.isString(file) ? file : file.pattern);
                    files.push(createServedPattern(ctx.toUrl(flname), _.isString(file) ? null : file));
                    return _.map(glob.sync(flname), (fm: string) => ctx.toUrl(fileBasePath, fm));
                }));

                console.log('expandedFiles:', client.systemjs.expandedFiles);
            }
            addExpandedFiles();

            emitter.on('file_list_modified', addExpandedFiles);

            // Add served files to files array
            _.each(systemjs.serveFiles, file => {
                files.push(createServedPattern(ctx.toUrl(path.join(fileBasePath, _.isString(file) ? file : file.pattern))));
            });

            // Allow Karma to serve all files within systemjs_packages.
            // This allows systemjs/SystemJS to load them
            var systemjsPattern = createServedPattern(
                ctx.toUrl(path.join(packagesPath, '!(system-polyfills.js|system.js|system-polyfills.src.js|system.src.js)/**')), { nocache: systemjs.cachePackages !== true }
            );
            systemjsPattern.watched = false;
            files.push(systemjsPattern);

            console.log('------------------------complete systemjs pattern:\n', files);
        };
        initSystemjs.$inject = ['config.files', 'config.basePath', 'config.systemjs', 'config.client', 'emitter'];

        cfg.frameworks.unshift('systemjsdev');
        cfg.plugins.unshift({
            'framework:systemjsdev': ['factory', initSystemjs]
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
            'initialized systemjs via installing a dependency with systemjs, ' +
            'or by running "systemjs dl-loader".');
    }


    System.config({ baseURL: karma.config.systemjs.baseURL?  'base/'+ karma.config.systemjs.baseURL : 'base' });
    

    var stripExtension = typeof karma.config.systemjs.stripExtension === 'boolean' ? karma.config.systemjs.stripExtension : true;

    // Prevent immediately starting tests.
    karma.loaded  = function() {

        if (karma.config.systemjs.paths !== undefined &&
            typeof karma.config.systemjs.paths === 'object') {

            System.config({
                paths: karma.config.systemjs.paths
            });
        }

        if (karma.config.systemjs.meta !== undefined &&
            typeof karma.config.systemjs.meta === 'object') {
            System.config({
                meta: karma.config.systemjs.meta
            });
        }

        // Exclude bundle configurations if useBundles option is not specified
        if (!karma.config.systemjs.useBundles) {
            System.bundles = [];
        }

        // Load everything specified in loadFiles in the specified order
        var promiseChain = Promise.resolve();
        for (var i = 0; i < karma.config.systemjs.expandedFiles.length; i++) {
            promiseChain = promiseChain.then((function(moduleName) {
                return function() {
                    return System['import'](moduleName);
                };
            })(extractModuleName(karma.config.systemjs.expandedFiles[i])));
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


    checkAdapter(sysKarma: KarmaSystemjsOption, ctx: ITaskContext): string {

        let templ = sysKarma.karmaloader;
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
