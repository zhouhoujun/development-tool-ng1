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
/// <reference types="mocha"/>
var _ = require('lodash');
var development_core_1 = require('development-core');
var path = require('path');
var WebDefine = function () {
    function WebDefine() {
        _classCallCheck(this, WebDefine);
    }

    _createClass(WebDefine, [{
        key: "getContext",
        value: function getContext(config) {
            // register default asserts.
            config.option.asserts = _.extend({
                ts: 'development-assert-ts',
                js: 'development-assert-js'
            }, config.option.asserts);
            return development_core_1.bindingConfig(config);
        }
    }, {
        key: "tasks",
        value: function tasks(ctx) {
            return ctx.findTasksInDir(path.join(__dirname, './tasks'));
        }
    }]);

    return WebDefine;
}();
WebDefine = __decorate([development_core_1.taskdefine, __metadata('design:paramtypes', [])], WebDefine);
exports.WebDefine = WebDefine;
//# sourceMappingURL=sourcemaps/index.js.map
