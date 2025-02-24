"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "WidgetsService", {
    enumerable: true,
    get: function() {
        return WidgetsService;
    }
});
const _common = require("@nestjs/common");
const _bundlebuilderservice = require("../bundle-builders/bundle-builder.service");
const _BundleBuilderWidgetDto = require("./dto/BundleBuilderWidgetDto");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let WidgetsService = class WidgetsService {
    async getWidget(bundleId, shop) {
        try {
            const bundleBuilder = await this.bundleBuilderService.findOne(bundleId, shop, true);
            return new _BundleBuilderWidgetDto.BundleBuilderWidgetDto(bundleBuilder);
        } catch (error) {
            return new _BundleBuilderWidgetDto.BundleBuilderWidgetDto(null);
        }
    }
    constructor(bundleBuilderService){
        this.bundleBuilderService = bundleBuilderService;
    }
};
WidgetsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _bundlebuilderservice.BundleBuilderService === "undefined" ? Object : _bundlebuilderservice.BundleBuilderService
    ])
], WidgetsService);

//# sourceMappingURL=widgets.service.js.map