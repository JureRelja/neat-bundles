"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ProxyAuthMiddleware", {
    enumerable: true,
    get: function() {
        return ProxyAuthMiddleware;
    }
});
const _common = require("@nestjs/common");
const _proxyauthservice = require("./proxy-auth.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let ProxyAuthMiddleware = class ProxyAuthMiddleware {
    async use(req, res, next) {
        await this.proxyAuthService.authentificate(req);
        next();
    }
    constructor(proxyAuthService){
        this.proxyAuthService = proxyAuthService;
    }
};
ProxyAuthMiddleware = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _proxyauthservice.ProxyAuthService === "undefined" ? Object : _proxyauthservice.ProxyAuthService
    ])
], ProxyAuthMiddleware);

//# sourceMappingURL=proxy-auth.middleware.js.map