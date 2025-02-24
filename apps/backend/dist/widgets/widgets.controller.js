"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "WidgetsController", {
    enumerable: true,
    get: function() {
        return WidgetsController;
    }
});
const _common = require("@nestjs/common");
const _widgetsservice = require("./widgets.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let WidgetsController = class WidgetsController {
    async root(shop) {
        return this.widgetService.getWidget(1, shop);
    }
    constructor(widgetService){
        this.widgetService = widgetService;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    (0, _common.Render)("widget"),
    (0, _common.Header)("Content-type", "application/liquid"),
    _ts_param(0, (0, _common.Query)("shop")),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], WidgetsController.prototype, "root", null);
WidgetsController = _ts_decorate([
    (0, _common.Controller)("widgets"),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _widgetsservice.WidgetsService === "undefined" ? Object : _widgetsservice.WidgetsService
    ])
], WidgetsController);

//# sourceMappingURL=widgets.controller.js.map