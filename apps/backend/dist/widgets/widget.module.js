"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "WidgetsModule", {
    enumerable: true,
    get: function() {
        return WidgetsModule;
    }
});
const _common = require("@nestjs/common");
const _widgetscontroller = require("./widgets.controller");
const _bundlebuildermodule = require("../bundle-builders/bundle-builder.module");
const _widgetsservice = require("./widgets.service");
const _proxyauthmiddleware = require("../auth/proxy-auth.middleware");
const _authmodule = require("../auth/auth.module");
const _cachemodule = require("../cache/cache.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let WidgetsModule = class WidgetsModule {
    configure(consumer) {
        consumer.apply(_proxyauthmiddleware.ProxyAuthMiddleware).forRoutes("widget");
    // consumer.apply(CacheMiddleware).forRoutes("widget");
    }
};
WidgetsModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _bundlebuildermodule.BundleBuilderModule,
            _authmodule.AuthModule,
            _cachemodule.CacheModule
        ],
        controllers: [
            _widgetscontroller.WidgetsController
        ],
        providers: [
            _widgetsservice.WidgetsService
        ]
    })
], WidgetsModule);

//# sourceMappingURL=widget.module.js.map