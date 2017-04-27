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
        this.info.name = this.info.name || 'web-test';
        return this.info;
    };
    KarmaTest.prototype.setup = function (ctx, gulp) {
        var _this = this;
        var option = ctx.option.karma || {};
        var tkn = ctx.subTaskName(this.getInfo());
        gulp.task(tkn, function (callback) {
            var karmaConfigFile = option.configFile || path.join(ctx.env.root, './karma.conf.js');
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
            cfg = _.extend(cfg, { singleRun: ctx.env.release || ctx.env.deploy || ctx.env.watch !== true });
            if (option.basePath) {
                cfg.basePath = ctx.toStr(option.basePath);
            }
            else if (_.isUndefined(cfg.basePath)) {
                cfg.basePath = ctx.getDist();
            }
            cfg.basePath = ctx.toRootPath(cfg.basePath);
            if (option.jspm) {
                cfg.files = cfg.files || [];
                cfg = _this.initkarmaJspmPlugin(cfg, ctx);
            }
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
        // let jpk = <string>option.jspmPackages;
        // let jp = path.basename(jpk) + '/*';
        // paths[jp] = self.toUrl(rootpath, path.join(jpk, jp));
        return paths;
    };
    KarmaTest.prototype.initkarmaJspmPlugin = function (cfg, ctx) {
        var option = ctx.option.karma || {};
        var pkg = ctx.getPackage();
        var karmajspm;
        if (_.isFunction(option.jspm)) {
            karmajspm = option.jspm(ctx);
        }
        else if (_.isBoolean(karma)) {
            karmajspm = {};
        }
        else {
            karmajspm = option.jspm;
        }
        var jspmcfg = cfg['jspm'] || {};
        var adapterfile = ctx.toUrl(this.checkAdapter(karmajspm, ctx));
        if (karmajspm.packages) {
            jspmcfg.packages = ctx.toRootPath(ctx.toStr(karmajspm.packages));
        }
        else {
            if (!jspmcfg.packages && pkg.jspm && pkg.jspm.directories) {
                jspmcfg.packages = ctx.toRootPath(pkg.jspm.directories.packages);
            }
            else if (jspmcfg.packages) {
                jspmcfg.packages = ctx.toRootPath(jspmcfg.packages);
            }
        }
        if (karmajspm.config) {
            jspmcfg.config = ctx.toDistSrc(ctx.toSrc(karmajspm.config));
        }
        else {
            if (!jspmcfg.config && pkg.jspm) {
                jspmcfg.config = ctx.toRootPath(pkg.jspm.configFile);
            }
            else if (jspmcfg.config) {
                jspmcfg.config = ctx.toDistSrc(jspmcfg.config);
            }
        }
        jspmcfg.config = _.isString(jspmcfg.config) ? ctx.toUrl(jspmcfg.config) : _.map(jspmcfg.config, function (it) { return ctx.toUrl(it); });
        jspmcfg.baseURL = ctx.toStr(karmajspm.baseURL || jspmcfg.baseURL || '');
        if (!_.isUndefined(karmajspm.cachePackages)) {
            jspmcfg.cachePackages = karmajspm.cachePackages;
        }
        var relpkg = ctx.toUrl(cfg.basePath, jspmcfg.packages);
        var resetBase = false;
        if (/^\.\./.test(relpkg)) {
            resetBase = true;
            var root_1 = cfg.basePath = ctx.getRootPath();
            jspmcfg.paths = this.getRelativePaths(ctx, cfg.basePath); // , 'base/');
            var rlpk = ctx.toUrl(root_1, jspmcfg.packages) + '/*';
            var jspmpk = path.basename(jspmcfg.packages) + '/*';
            jspmcfg.paths['/' + jspmpk] = 'base/' + rlpk;
            var res = ctx.to(karmajspm.resource) || ['public', 'asserts'];
            var relpth_1 = ctx.toUrl(root_1, ctx.getDist());
            cfg.proxies = cfg.proxies || {};
            cfg.files = cfg.files || [];
            _.each(_.isString(res) ? [res] : res, function (r) {
                cfg.files.push({ pattern: ctx.toUrl(root_1, ctx.toDistPath(r)) + '/**', included: false });
                var abr = /^\//.test(r) ? ('base' + r) : ('base/' + r);
                cfg.proxies[abr] = url.resolve(relpth_1, r);
            });
            // jspmcfg.paths = jspmcfg.paths || {};
            // jspmcfg.baseURL = ctx.toUrl(root, ctx.getDist());
            // let rlpk = ctx.toUrl(root, jspmcfg.packages) + '/*';
            // jspmcfg.paths[rlpk] = '/base/' + rlpk;
            console.log('paths: ', jspmcfg.paths);
            cfg.proxies = _.extend(cfg.proxies, jspmcfg.paths);
            cfg.proxies[path.basename(jspmcfg.packages)] = ctx.toUrl(root_1, jspmcfg.packages);
            console.log('proxies: ', cfg.proxies);
        }
        jspmcfg.loadFiles = jspmcfg.loadFiles || [];
        jspmcfg.serveFiles = jspmcfg.serveFiles || [];
        if (karmajspm.loadFiles) {
            jspmcfg.loadFiles = jspmcfg.loadFiles.concat(_.isFunction(karmajspm.loadFiles) ? karmajspm.loadFiles(ctx) : karmajspm.loadFiles);
        }
        if (karmajspm.serveFiles) {
            jspmcfg.serveFiles = jspmcfg.serveFiles.concat(_.isFunction(karmajspm.serveFiles) ? karmajspm.serveFiles(ctx) : karmajspm.serveFiles);
        }
        cfg.plugins = _.filter(cfg.plugins || [], function (it) { return it !== 'karma-jspm'; });
        cfg.frameworks = _.filter(cfg.frameworks || [], function (it) { return it !== 'jspm'; });
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
        var initJspm = function (files, basePath, jspm, client, emitter) {
            console.log('--------------------init karma jspm---------------------\n', 'base path:', chalk.cyan(basePath));
            jspm = jspm || {};
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
            var baseURL = jspm.baseURL;
            client.jspm.baseURL = baseURL || '';
            console.log('base URL:', chalk.cyan(baseURL));
            var fileBasePath = ctx.toUrl(resetBase ? ctx.getDist() : path.join(basePath, baseURL));
            console.log('fileBasePath', fileBasePath);
            var packagesPath = ctx.toUrl(jspm.packages);
            var browserPath = ctx.toUrl(ctx.toRootPath(ctx.toStr(jspm.browser || '')));
            var configPaths = Array.isArray(jspm.config) ? jspm.config : [jspm.config];
            // Add SystemJS loader and jspm config
            Array.prototype.unshift.apply(files, configPaths.map(function (configPath) {
                return createPattern(configPath);
            }));
            // Needed for JSPM 0.17 beta
            if (jspm.browser) {
                files.unshift(createPattern(browserPath));
            }
            files.unshift(createPattern(adapterfile));
            var sysjs = karmajspm.systemjs ? ctx.toSrc(karmajspm.systemjs) : ['system-polyfills', 'system'];
            _.each(_.isArray(sysjs) ? sysjs : [sysjs], function (sf) {
                files.unshift(createPattern(ctx.toUrl(getPackageFilePath(packagesPath, sf))));
            });
            function addExpandedFiles() {
                client.jspm.expandedFiles = _.flatten(_.map(jspm.loadFiles, function (file) {
                    var flname = path.join(fileBasePath, _.isString(file) ? file : file.pattern);
                    files.push(createServedPattern(ctx.toUrl(flname), _.isString(file) ? null : file));
                    return _.map(glob.sync(flname), function (fm) { return ctx.toUrl(fileBasePath, fm); });
                }));
                console.log('expandedFiles:', client.jspm.expandedFiles);
            }
            addExpandedFiles();
            emitter.on('file_list_modified', addExpandedFiles);
            // Add served files to files array
            _.each(jspm.serveFiles, function (file) {
                files.push(createServedPattern(ctx.toUrl(path.join(fileBasePath, _.isString(file) ? file : file.pattern))));
            });
            // Allow Karma to serve all files within jspm_packages.
            // This allows jspm/SystemJS to load them
            var jspmPattern = createServedPattern(ctx.toUrl(path.join(packagesPath, '!(system-polyfills.js|system.js|system-polyfills.src.js|system.src.js)/**')), { nocache: jspm.cachePackages !== true });
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
    };
    KarmaTest.prototype.getDefaultAdapter = function () {
        return {
            name: 'adapter',
            template: "\n(function(karma, System) {\n    if (!System) {\n        throw new Error('SystemJS was not found. Please make sure you have ' +\n            'initialized jspm via installing a dependency with jspm, ' +\n            'or by running \"jspm dl-loader\".');\n    }\n\n\n    System.config({ baseURL: karma.config.jspm.baseURL?  'base/'+ karma.config.jspm.baseURL : 'base' });\n    \n\n    var stripExtension = typeof karma.config.jspm.stripExtension === 'boolean' ? karma.config.jspm.stripExtension : true;\n\n    // Prevent immediately starting tests.\n    karma.loaded  = function() {\n\n        if (karma.config.jspm.paths !== undefined &&\n            typeof karma.config.jspm.paths === 'object') {\n\n            System.config({\n                paths: karma.config.jspm.paths\n            });\n        }\n\n        if (karma.config.jspm.meta !== undefined &&\n            typeof karma.config.jspm.meta === 'object') {\n            System.config({\n                meta: karma.config.jspm.meta\n            });\n        }\n\n        // Exclude bundle configurations if useBundles option is not specified\n        if (!karma.config.jspm.useBundles) {\n            System.bundles = [];\n        }\n\n        // Load everything specified in loadFiles in the specified order\n        var promiseChain = Promise.resolve();\n        for (var i = 0; i < karma.config.jspm.expandedFiles.length; i++) {\n            promiseChain = promiseChain.then((function(moduleName) {\n                return function() {\n                    return System['import'](moduleName);\n                };\n            })(extractModuleName(karma.config.jspm.expandedFiles[i])));\n        }\n\n        promiseChain.then(function() {\n            karma.start();\n        }, function(e) {\n            karma.error(e.name + ': ' + e.message);\n        });\n    };\n\n    function extractModuleName(fileName) {\n        if (stripExtension) {\n            return fileName.replace(/.js$/, '');\n        }\n        return fileName;\n    }\n})(window.__karma__, window.System);"
        };
    };
    KarmaTest.prototype.checkAdapter = function (karmajspm, ctx) {
        var templ = karmajspm.karmaloader;
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
            fs.writeFileSync(adapterfile, templ.template, 'utf8');
        }
        return adapterfile;
    };
    return KarmaTest;
}());
KarmaTest = __decorate([
    development_core_1.task({
        order: function (total) { return { value: 2 / total, runWay: development_core_1.RunWay.parallel }; },
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
