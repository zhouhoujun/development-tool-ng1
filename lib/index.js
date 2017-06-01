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
/// <reference types="mocha"/>
var _ = require("lodash");
var development_core_1 = require("development-core");
var clean_1 = require("./tasks/clean");
var serve_1 = require("./tasks/serve");
var test_1 = require("./tasks/test");
var WebDefine = (function () {
    function WebDefine() {
    }
    WebDefine.prototype.getContext = function (config) {
        // register default asserts.
        config.option.asserts = _.extend({
            ts: 'development-assert-ts',
            js: 'development-assert-js'
        }, config.option.asserts);
        return development_core_1.bindingConfig(config);
    };
    WebDefine.prototype.tasks = function (ctx) {
        var tasks = [
            clean_1.Clean,
            serve_1.StartServer,
            test_1.KarmaTest
        ];
        var option = ctx.option;
        if (option.forceTest === false || ctx.env.test === false || ctx.env.test === 'false') {
            tasks.pop();
        }
        return ctx.findTasks(tasks);
        // return ctx.findTasksInDir(path.join(__dirname, './tasks'));
    };
    return WebDefine;
}());
WebDefine = __decorate([
    development_core_1.taskdefine,
    __metadata("design:paramtypes", [])
], WebDefine);
exports.WebDefine = WebDefine;

//# sourceMappingURL=sourcemaps/index.js.map
