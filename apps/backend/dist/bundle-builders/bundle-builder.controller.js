"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BundleBuilderController", {
    enumerable: true,
    get: function() {
        return BundleBuilderController;
    }
});
const _common = require("@nestjs/common");
const _bundlebuilderservice = require("./bundle-builder.service");
const _createbundlebuilderdto = require("./dto/create-bundle-builder.dto");
const _updatebundlebuilderdto = require("./dto/update-bundle-builder.dto");
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
let BundleBuilderController = class BundleBuilderController {
    async create(createBundleBuilderDto) {
        return this.bundleBuilderService.create(createBundleBuilderDto);
    }
    async findAll(shop) {
        return this.bundleBuilderService.findAll(shop);
    }
    async findOne(id, shop, includeSteps) {
        return this.bundleBuilderService.findOne(+id, shop, includeSteps);
    }
    update(id, updateBundleBuilderDto) {
        return this.bundleBuilderService.update(+id, updateBundleBuilderDto);
    }
    remove(id) {
        return this.bundleBuilderService.remove(+id);
    }
    constructor(bundleBuilderService){
        this.bundleBuilderService = bundleBuilderService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createbundlebuilderdto.CreateBundleBuilderDto === "undefined" ? Object : _createbundlebuilderdto.CreateBundleBuilderDto
    ]),
    _ts_metadata("design:returntype", Promise)
], BundleBuilderController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)("/:shop"),
    _ts_param(0, (0, _common.Param)("shop")),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], BundleBuilderController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)("/:shop/:id"),
    _ts_param(0, (0, _common.Param)("id")),
    _ts_param(1, (0, _common.Param)("shop")),
    _ts_param(2, (0, _common.Query)("includeSteps")),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        Boolean
    ]),
    _ts_metadata("design:returntype", Promise)
], BundleBuilderController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Patch)(":id"),
    _ts_param(0, (0, _common.Param)("id")),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatebundlebuilderdto.UpdateBundleBuilderDto === "undefined" ? Object : _updatebundlebuilderdto.UpdateBundleBuilderDto
    ]),
    _ts_metadata("design:returntype", void 0)
], BundleBuilderController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(":id"),
    _ts_param(0, (0, _common.Param)("id")),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], BundleBuilderController.prototype, "remove", null);
BundleBuilderController = _ts_decorate([
    (0, _common.Controller)("bundle-builders"),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _bundlebuilderservice.BundleBuilderService === "undefined" ? Object : _bundlebuilderservice.BundleBuilderService
    ])
], BundleBuilderController);

//# sourceMappingURL=bundle-builder.controller.js.map