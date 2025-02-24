"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BundleBuilderModule", {
    enumerable: true,
    get: function() {
        return BundleBuilderModule;
    }
});
const _common = require("@nestjs/common");
const _bundlebuilderservice = require("./bundle-builder.service");
const _bundlebuildercontroller = require("./bundle-builder.controller");
const _bundlebuilderrepository = require("./bundle-builder.repository");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let BundleBuilderModule = class BundleBuilderModule {
};
BundleBuilderModule = _ts_decorate([
    (0, _common.Module)({
        controllers: [
            _bundlebuildercontroller.BundleBuilderController
        ],
        providers: [
            _bundlebuilderservice.BundleBuilderService,
            _bundlebuilderrepository.BundleBuilderRepository
        ],
        exports: [
            _bundlebuilderservice.BundleBuilderService
        ]
    })
], BundleBuilderModule);

//# sourceMappingURL=bundle-builder.module.js.map