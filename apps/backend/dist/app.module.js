"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AppModule", {
    enumerable: true,
    get: function() {
        return AppModule;
    }
});
const _common = require("@nestjs/common");
const _bundlebuildermodule = require("./bundle-builders/bundle-builder.module");
const _widgetmodule = require("./widgets/widget.module");
const _shopifymodule = require("./shopify/shopify.module");
const _authmodule = require("./auth/auth.module");
const _usersmodule = require("./users/users.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let AppModule = class AppModule {
};
AppModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _bundlebuildermodule.BundleBuilderModule,
            _shopifymodule.ShopifyModule,
            _authmodule.AuthModule,
            _widgetmodule.WidgetsModule,
            _usersmodule.UsersModule,
            _usersmodule.UsersModule
        ]
    })
], AppModule);

//# sourceMappingURL=app.module.js.map