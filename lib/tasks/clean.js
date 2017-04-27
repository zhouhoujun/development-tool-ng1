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
var development_core_1 = require("development-core");
var del = require('del');
var Clean = (function () {
    function Clean(info) {
        this.info = info;
    }
    Clean.prototype.getInfo = function () {
        this.info.name = this.info.name || 'web-clean';
        return this.info;
    };
    Clean.prototype.setup = function (ctx, gulp) {
        var info = this.getInfo();
        var tkn = ctx.subTaskName(info);
        gulp.task(tkn, function () {
            return del(ctx.getSrc(info));
        });
        return tkn;
    };
    return Clean;
}());
Clean = __decorate([
    development_core_1.task({
        order: 0,
        oper: development_core_1.Operation.clean | development_core_1.Operation.default
    }),
    __metadata("design:paramtypes", [Object])
], Clean);
exports.Clean = Clean;

//# sourceMappingURL=../sourcemaps/tasks/clean.js.map
