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
var chalk = require("chalk");
// import * as path from 'path';
var development_core_1 = require("development-core");
// import * as chalk from 'chalk';
var karma = require("karma");
var fs = require("fs");
var path = require("path");
var glob = require('glob');
var mkdirp = require('mkdirp');
var url = require("url");
var KarmaTest = (function () {
    function KarmaTest(info) {
        this.info = info;
    }
    KarmaTest.prototype.getInfo = function () {
        this.info.name = this.info.name || 'karma';
        return this.info;
    };
    KarmaTest.prototype.setup = function (ctx, gulp) {
        var _this = this;
        var option = ctx.option.karma || {};
        // console.log('web test:----------------------\n', ctx.getRootPath());
        var tkn = ctx.subTaskName(this.getInfo());
        gulp.task(tkn, function (callback) {
            var karmaConfigFile = option.configFile || path.join(ctx.getRootPath(), './karma.conf.js');
            karmaConfigFile = ctx.toRootPath(karmaConfigFile);
            var cfg = {};
            // get config.
            require(karmaConfigFile)({
                set: function (config) {
                    cfg = _.extend(cfg, config);
                }
            });
            if (option.config) {
                cfg = option.config(ctx);
            }
            cfg = _.extend(cfg, { singleRun: ((ctx.oper & development_core_1.Operation.release) > 0) || ((ctx.oper & development_core_1.Operation.watch) === 0) });
            if (option.basePath) {
                cfg.basePath = ctx.toStr(option.basePath);
            }
            else if (_.isUndefined(cfg.basePath)) {
                cfg.basePath = ctx.getDist();
            }
            cfg.basePath = ctx.toRootPath(cfg.basePath);
            if (!option.systemjs && option['jspm']) {
                option.systemjs = option['jspm'];
            }
            // console.log('before init option:----------------------------\n', ctx.option);
            if (option.systemjs) {
                cfg.files = cfg.files || [];
                cfg = _this.initkarmaSystemjsPlugin(cfg, ctx);
            }
            // console.log('cfg:----------------------------\n', cfg);
            var serve = new karma.Server(cfg, function (code) {
                if (code === 1) {
                    console.log(chalk.red('Unit Test failures, exiting process'), ', code:', chalk.cyan(code));
                    callback('Unit Test failures, exiting process');
                }
                else {
                    console.log('Unit Tests passed', ', code:', chalk.cyan(code));
                    callback();
                }
            });
            serve.start();
        });
        return tkn;
    };
    KarmaTest.prototype.getRelativePaths = function (ctx, rootpath, prefix) {
        if (prefix === void 0) { prefix = ''; }
        var paths = {};
        var bundleDest = ctx.getDist();
        var dir = fs.readdirSync(bundleDest);
        _.each(dir, function (d) {
            var sf = path.join(bundleDest, d);
            var f = fs.lstatSync(sf);
            if (f.isDirectory()) {
                var p_1 = '/' + d + '/*';
                paths[p_1] = prefix + ctx.toUrl(rootpath, path.join(bundleDest, p_1));
            }
        });
        var p = '*';
        paths[p] = prefix + ctx.toUrl(rootpath, path.join(bundleDest, p));
        // let jpk = <string>option.systemjsPackages;
        // let jp = path.basename(jpk) + '/*';
        // paths[jp] = self.toUrl(rootpath, path.join(jpk, jp));
        return paths;
    };
    KarmaTest.prototype.initkarmaSystemjsPlugin = function (cfg, ctx) {
        var option = ctx.option.karma || {};
        var pkg = ctx.getPackage();
        var karmaSystemjs;
        if (_.isFunction(option.systemjs)) {
            karmaSystemjs = option.systemjs(ctx);
        }
        else if (_.isBoolean(karma)) {
            karmaSystemjs = {};
        }
        else {
            karmaSystemjs = option.systemjs;
        }
        var syscfg = cfg['systemjs'] || cfg['jspm'] || {};
        var adapterfile = ctx.toUrl(this.checkAdapter(karmaSystemjs, ctx));
        if (karmaSystemjs.packages) {
            syscfg.packages = ctx.toRootPath(ctx.toStr(karmaSystemjs.packages));
        }
        else {
            if (!syscfg.packages && pkg.systemjs && pkg.systemjs.directories) {
                syscfg.packages = ctx.toRootPath(pkg.systemjs.directories.packages);
            }
            else if (syscfg.packages) {
                syscfg.packages = ctx.toRootPath(syscfg.packages);
            }
        }
        if (karmaSystemjs.config) {
            syscfg.config = ctx.toDistSrc(ctx.toSrc(karmaSystemjs.config));
        }
        else {
            if (!syscfg.config && pkg.systemjs) {
                syscfg.config = ctx.toRootPath(pkg.systemjs.configFile);
            }
            else if (syscfg.config) {
                syscfg.config = ctx.toDistSrc(syscfg.config);
            }
        }
        syscfg.config = _.isString(syscfg.config) ? ctx.toUrl(syscfg.config) : _.map(syscfg.config, function (it) { return ctx.toUrl(it); });
        syscfg.baseURL = ctx.toStr(karmaSystemjs.baseURL || syscfg.baseURL || '');
        if (!_.isUndefined(karmaSystemjs.cachePackages)) {
            syscfg.cachePackages = karmaSystemjs.cachePackages;
        }
        console.log('packages:------------------------\n', syscfg.packages);
        var relpkg = ctx.toUrl(cfg.basePath, syscfg.packages);
        var resetBase = false;
        if (/^\.\./.test(relpkg)) {
            resetBase = true;
            var root_1 = cfg.basePath = ctx.getRootPath();
            syscfg.paths = this.getRelativePaths(ctx, cfg.basePath); // , 'base/');
            var rlpk = ctx.toUrl(root_1, syscfg.packages) + '/*';
            var systempk = path.basename(syscfg.packages) + '/*';
            syscfg.paths['/' + systempk] = 'base/' + rlpk;
            var res = ctx.to(karmaSystemjs.resource) || ['public', 'asserts'];
            var relpth_1 = ctx.toUrl(root_1, ctx.getDist());
            cfg.proxies = cfg.proxies || {};
            cfg.files = cfg.files || [];
            _.each(_.isString(res) ? [res] : res, function (r) {
                cfg.files.push({ pattern: ctx.toUrl(root_1, ctx.toDistPath(r)) + '/**', included: false });
                var abr = /^\//.test(r) ? ('base' + r) : ('base/' + r);
                cfg.proxies[abr] = url.resolve(relpth_1, r);
            });
            console.log('paths: ', syscfg.paths);
            cfg.proxies = _.extend(cfg.proxies, syscfg.paths);
            cfg.proxies[path.basename(syscfg.packages)] = ctx.toUrl(root_1, syscfg.packages);
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
        cfg.plugins = _.filter(cfg.plugins || [], function (it) { return it !== 'karma-systemjs'; });
        cfg.frameworks = _.filter(cfg.frameworks || [], function (it) { return it !== 'systemjs'; });
        // clean.
        cfg.plugins = cfg.plugins.concat(_.map(cfg.frameworks, function (it) { return 'karma-' + it.toLowerCase(); }));
        cfg.plugins = cfg.plugins.concat(_.map(cfg.reporters, function (it) {
            var packname = 'karma-' + it.toLowerCase() + '-reporter';
            if (pkg.dependencies[packname] || pkg.devDependencies[packname]) {
                return packname;
            }
            return 'karma-' + it;
        }));
        cfg.plugins = cfg.plugins.concat(_.map(cfg.browsers, function (it) {
            var packname = 'karma-' + it.toLowerCase() + '-launcher';
            if (pkg.dependencies[packname] || pkg.devDependencies[packname]) {
                return packname;
            }
            return 'karma-' + it;
        }));
        cfg.plugins = _.uniq(cfg.plugins);
        var initSystemjs = function (files, basePath, systemjs, client, emitter) {
            console.log('--------------------init karma systemjs---------------------\n', 'base path:', chalk.cyan(basePath));
            systemjs = systemjs || {};
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
            var baseURL = systemjs.baseURL;
            client.systemjs.baseURL = baseURL || '';
            console.log('base URL:', chalk.cyan(baseURL));
            var fileBasePath = ctx.toUrl(resetBase ? ctx.getDist() : path.join(basePath, baseURL));
            console.log('fileBasePath', fileBasePath);
            var packagesPath = ctx.toUrl(systemjs.packages);
            var browserPath = ctx.toUrl(ctx.toRootPath(ctx.toStr(systemjs.browser || '')));
            var configPaths = Array.isArray(systemjs.config) ? systemjs.config : [systemjs.config];
            // Add SystemJS loader and systemjs config
            Array.prototype.unshift.apply(files, configPaths.map(function (configPath) {
                return createPattern(configPath);
            }));
            // Needed for JSPM 0.17 beta
            if (systemjs.browser) {
                files.unshift(createPattern(browserPath));
            }
            files.unshift(createPattern(adapterfile));
            var sysjs = karmaSystemjs.systemjs ? ctx.toSrc(karmaSystemjs.systemjs) : ['system-polyfills', 'system'];
            _.each(_.isArray(sysjs) ? sysjs : [sysjs], function (sf) {
                files.unshift(createPattern(ctx.toUrl(getPackageFilePath(packagesPath, sf))));
            });
            function addExpandedFiles() {
                client.systemjs.expandedFiles = _.flatten(_.map(systemjs.loadFiles, function (file) {
                    var flname = path.join(fileBasePath, _.isString(file) ? file : file.pattern);
                    files.push(createServedPattern(ctx.toUrl(flname), _.isString(file) ? null : file));
                    return _.map(glob.sync(flname), function (fm) { return ctx.toUrl(fileBasePath, fm); });
                }));
                console.log('expandedFiles:', client.systemjs.expandedFiles);
            }
            addExpandedFiles();
            emitter.on('file_list_modified', addExpandedFiles);
            // Add served files to files array
            _.each(systemjs.serveFiles, function (file) {
                files.push(createServedPattern(ctx.toUrl(path.join(fileBasePath, _.isString(file) ? file : file.pattern))));
            });
            // Allow Karma to serve all files within systemjs_packages.
            // This allows systemjs/SystemJS to load them
            var systemjsPattern = createServedPattern(ctx.toUrl(path.join(packagesPath, '!(system-polyfills.js|system.js|system-polyfills.src.js|system.src.js)/**')), { nocache: systemjs.cachePackages !== true });
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
    };
    KarmaTest.prototype.getDefaultAdapter = function () {
        return {
            name: 'adapter',
            template: "\n(function(karma, System) {\n    if (!System) {\n        throw new Error('SystemJS was not found. Please make sure you have ' +\n            'initialized systemjs via installing a dependency with systemjs, ' +\n            'or by running \"systemjs dl-loader\".');\n    }\n\n\n    System.config({ baseURL: karma.config.systemjs.baseURL?  'base/'+ karma.config.systemjs.baseURL : 'base' });\n    \n\n    var stripExtension = typeof karma.config.systemjs.stripExtension === 'boolean' ? karma.config.systemjs.stripExtension : true;\n\n    // Prevent immediately starting tests.\n    karma.loaded  = function() {\n\n        if (karma.config.systemjs.paths !== undefined &&\n            typeof karma.config.systemjs.paths === 'object') {\n\n            System.config({\n                paths: karma.config.systemjs.paths\n            });\n        }\n\n        if (karma.config.systemjs.meta !== undefined &&\n            typeof karma.config.systemjs.meta === 'object') {\n            System.config({\n                meta: karma.config.systemjs.meta\n            });\n        }\n\n        // Exclude bundle configurations if useBundles option is not specified\n        if (!karma.config.systemjs.useBundles) {\n            System.bundles = [];\n        }\n\n        // Load everything specified in loadFiles in the specified order\n        var promiseChain = Promise.resolve();\n        for (var i = 0; i < karma.config.systemjs.expandedFiles.length; i++) {\n            promiseChain = promiseChain.then((function(moduleName) {\n                return function() {\n                    return System['import'](moduleName);\n                };\n            })(extractModuleName(karma.config.systemjs.expandedFiles[i])));\n        }\n\n        promiseChain.then(function() {\n            karma.start();\n        }, function(e) {\n            karma.error(e.name + ': ' + e.message);\n        });\n    };\n\n    function extractModuleName(fileName) {\n        if (stripExtension) {\n            return fileName.replace(/.js$/, '');\n        }\n        return fileName;\n    }\n})(window.__karma__, window.System);"
        };
    };
    KarmaTest.prototype.checkAdapter = function (sysKarma, ctx) {
        var templ = sysKarma.karmaloader;
        var defaultTempl = this.getDefaultAdapter();
        if (!templ) {
            templ = defaultTempl;
        }
        else {
            if (templ.name === defaultTempl.name) {
                console.log(chalk.red('can not rewrite default adapter named: "adapter".'));
                templ = defaultTempl;
            }
        }
        var adapterfile = path.join(__dirname, './adapters', templ.name);
        if (!/.js$/.test(adapterfile)) {
            adapterfile = adapterfile + '.js';
        }
        mkdirp.sync(path.dirname(adapterfile));
        if (!fs.existsSync(adapterfile)) {
            fs.writeFileSync(adapterfile, templ.template, { encoding: 'utf8' });
        }
        return adapterfile;
    };
    return KarmaTest;
}());
KarmaTest = __decorate([
    development_core_1.task({
        // order: total => { return { value: 2 / total, runWay: RunWay.parallel } },
        oper: development_core_1.Operation.default | development_core_1.Operation.test
    }),
    __metadata("design:paramtypes", [Object])
], KarmaTest);
exports.KarmaTest = KarmaTest;
function getPackageFilePath(packagesPath, fileName) {
    var fm = path.join(packagesPath, fileName + '@*.js');
    var exists = glob.sync(fm);
    if (exists && exists.length !== 0) {
        return fm;
    }
    else {
        return path.join(packagesPath, fileName + '.js');
    }
}
var createPattern = function (path) {
    return { pattern: path, included: true, served: true, watched: false };
};
var createServedPattern = function (pathstr, file) {
    return {
        pattern: pathstr,
        included: file && 'included' in file ? file.included : false,
        served: file && 'served' in file ? file.served : true,
        nocache: file && 'nocache' in file ? file.nocache : false,
        watched: file && 'watched' in file ? file.watched : true
    };
};

//# sourceMappingURL=../sourcemaps/tasks/test.js.map
