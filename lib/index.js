"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var development_core_1 = require("development-core");
var clean_1 = require("./tasks/clean");
var serve_1 = require("./tasks/serve");
var test_1 = require("./tasks/test");
var WebDefine = (function () {
    function WebDefine() {
    }
    WebDefine.prototype.loadConfig = function (option, env) {
        // register default asserts.
        if (_.isUndefined(option.assertsOrder)) {
            option.assertsOrder = 0;
        }
        option.asserts = _.extend({
            css: development_core_1.Operation.default | development_core_1.Operation.autoWatch,
            jpeg: development_core_1.Operation.default | development_core_1.Operation.autoWatch,
            jpg: development_core_1.Operation.default | development_core_1.Operation.autoWatch,
            gif: development_core_1.Operation.default | development_core_1.Operation.autoWatch,
            png: development_core_1.Operation.default | development_core_1.Operation.autoWatch,
            ioc: development_core_1.Operation.default | development_core_1.Operation.autoWatch,
            svg: development_core_1.Operation.default | development_core_1.Operation.autoWatch,
            ttf: development_core_1.Operation.default | development_core_1.Operation.autoWatch,
            woff: development_core_1.Operation.default | development_core_1.Operation.autoWatch,
            eot: development_core_1.Operation.default | development_core_1.Operation.autoWatch,
            ts: 'development-assert-ts',
            js: development_core_1.Operation.default | development_core_1.Operation.autoWatch
        }, option.asserts || {});
        return {
            option: option,
            env: env
        };
    };
    WebDefine.prototype.setContext = function (ctx) {
        var webOption = ctx.option;
        if (webOption.forceTest !== false && webOption.test !== false) {
            ctx.add({
                option: {
                    name: 'test',
                    karma: webOption.karma,
                    order: webOption.testOrder || (function (total) { return { value: 2 / total, runWay: development_core_1.RunWay.parallel }; }),
                    loader: function (ctx) {
                        return ctx.findTasks(test_1.KarmaTest);
                    }
                }
            });
        }
        if (ctx.oper & development_core_1.Operation.serve) {
            ctx.add({
                option: {
                    name: 'serve',
                    browsersync: webOption.browsersync,
                    order: function (total, ctx) { return ctx.env.test ? { value: 2 / total, runWay: development_core_1.RunWay.parallel } : 1; },
                    loader: function (ctx) {
                        return ctx.findTasks(serve_1.StartServer);
                    }
                }
            });
        }
    };
    WebDefine.prototype.tasks = function (ctx) {
        return ctx.findTasks(clean_1.Clean);
        // let tasks = [
        //     Clean,
        //     StartServer,
        //     KarmaTest
        // ];
        // let option: IWebTaskOption = ctx.option;
        // if (option.forceTest === false || ctx.env.test === false || ctx.env.test === 'false') {
        //     tasks.pop();
        // }
        // return ctx.findTasks(tasks);
        // return ctx.findTasksInDir(path.join(__dirname, './tasks'));
    };
    return WebDefine;
}());
WebDefine = __decorate([
    development_core_1.taskdefine()
], WebDefine);
exports.WebDefine = WebDefine;

//# sourceMappingURL=sourcemaps/index.js.map
