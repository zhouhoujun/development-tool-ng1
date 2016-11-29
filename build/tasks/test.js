"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var __decorate = undefined && undefined.__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if ((typeof Reflect === "undefined" ? "undefined" : _typeof(Reflect)) === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) {
        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    }return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = undefined && undefined.__metadata || function (k, v) {
    if ((typeof Reflect === "undefined" ? "undefined" : _typeof(Reflect)) === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _ = require('lodash');
var chalk = require('chalk');
// import * as path from 'path';
var development_core_1 = require('development-core');
// import * as chalk from 'chalk';
var karam = require('karma');
var path = require('path');
var KaramTest = function () {
    function KaramTest(info) {
        _classCallCheck(this, KaramTest);

        this.info = info;
    }

    _createClass(KaramTest, [{
        key: "getInfo",
        value: function getInfo() {
            this.info.name = this.info.name || 'test';
            return this.info;
        }
    }, {
        key: "setup",
        value: function setup(ctx, gulp) {
            var option = ctx.option;
            var tkn = ctx.subTaskName(this.getInfo());
            gulp.task(tkn, function (callback) {
                var karmaConfigFile = option.karmaConfigFile || path.join(ctx.env.root, './karma.conf.js');
                if (!path.isAbsolute(karmaConfigFile)) {
                    karmaConfigFile = path.join(ctx.env.root, karmaConfigFile);
                }
                var cfg = null;
                if (option.karmaConfig) {
                    cfg = option.karmaConfig(ctx);
                }
                if (option.karamjspm) {
                    cfg.files = cfg.files || [];
                    cfg.frameworks;
                }
                cfg = _.extend(cfg || { singleRun: ctx.env.release || ctx.env.deploy || ctx.env.watch !== true }, {
                    configFile: karmaConfigFile
                });
                if (option.karmaBasePath) {
                    cfg.basePath = ctx.toStr(option.karmaBasePath);
                } else if (_.isUndefined(cfg.basePath)) {
                    cfg.basePath = ctx.getDist();
                }
                var serve = new karam.Server(cfg, function (code) {
                    if (code === 1) {
                        console.log(chalk.red('Unit Test failures, exiting process'), ', code:', chalk.cyan(code));
                        callback('Unit Test failures, exiting process');
                    } else {
                        console.log('Unit Tests passed', ', code:', chalk.cyan(code));
                        callback();
                    }
                });
                if (option.karamjspm) {
                    serve.on('file_list_modified', function () {});
                }
                serve.start();
            });
            return tkn;
        }
    }]);

    return KaramTest;
}();
KaramTest = __decorate([development_core_1.task({
    order: { value: 0.25, runWay: development_core_1.RunWay.parallel },
    oper: development_core_1.Operation.default | development_core_1.Operation.test
}), __metadata('design:paramtypes', [Object])], KaramTest);
exports.KaramTest = KaramTest;
var createPattern = function createPattern(path) {
    return { pattern: path, included: true, served: true, watched: false };
};
var createServedPattern = function createServedPattern(path, file) {
    return {
        pattern: path,
        included: file && 'included' in file ? file.included : false,
        served: file && 'served' in file ? file.served : true,
        nocache: file && 'nocache' in file ? file.nocache : false,
        watched: file && 'watched' in file ? file.watched : true
    };
};
//# sourceMappingURL=../sourcemaps/tasks/test.js.map
