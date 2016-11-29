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
var development_core_1 = require('development-core');
var del = require('del');
var Clean = function () {
    function Clean(info) {
        _classCallCheck(this, Clean);

        this.info = info;
    }

    _createClass(Clean, [{
        key: "getInfo",
        value: function getInfo() {
            this.info.name = this.info.name || 'clean';
            return this.info;
        }
    }, {
        key: "setup",
        value: function setup(ctx, gulp) {
            var info = this.getInfo();
            var tkn = ctx.subTaskName(info);
            gulp.task(tkn, function () {
                return del(ctx.getSrc(info));
            });
            return tkn;
        }
    }]);

    return Clean;
}();
Clean = __decorate([development_core_1.task({
    order: 0,
    oper: development_core_1.Operation.clean | development_core_1.Operation.default
}), __metadata('design:paramtypes', [Object])], Clean);
exports.Clean = Clean;
//# sourceMappingURL=../sourcemaps/tasks/clean.js.map
