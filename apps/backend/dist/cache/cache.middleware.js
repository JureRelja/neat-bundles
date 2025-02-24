"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CacheMiddleware", {
    enumerable: true,
    get: function() {
        return CacheMiddleware;
    }
});
const _common = require("@nestjs/common");
const _cacheservice = require("./cache.service");
const _cachedatadto = require("./dto/cache-data.dto");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CacheMiddleware = class CacheMiddleware {
    async use(req, res, next) {
        const key = this.cacheService.reqToKey(req);
        const cacheData = await this.cacheService.readCache(key);
        if (cacheData !== null && cacheData !== undefined) {
            try {
                res.status(cacheData.statusCode).set(cacheData.headers);
                return res.send(cacheData.data);
            } catch (error) {
                console.error(error);
            }
        } else {
            const oldSend = res.send;
            res.send = (dataForCache)=>{
                // set the function back to avoid the 'double-send' effect
                res.send = oldSend;
                // cache the response only if it is successful
                if (res.statusCode.toString().startsWith("2")) {
                    this.cacheService.writeCache(key, new _cachedatadto.CacheData(res.statusCode, res.getHeaders(), dataForCache));
                }
                return res.send(dataForCache);
            };
        }
        next();
    }
    constructor(cacheService){
        this.cacheService = cacheService;
    }
};
CacheMiddleware = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _cacheservice.CacheService === "undefined" ? Object : _cacheservice.CacheService
    ])
], CacheMiddleware);

//# sourceMappingURL=cache.middleware.js.map