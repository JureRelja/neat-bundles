"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CacheService", {
    enumerable: true,
    get: function() {
        return CacheService;
    }
});
const _cacheserver = require("./cache.server");
const _objecthash = /*#__PURE__*/ _interop_require_default(require("object-hash"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
let CacheService = class CacheService {
    async readCache(key) {
        const data = await _cacheserver.redisClient.get(key);
        if (data) {
            return JSON.parse(data);
        }
        return null;
    }
    async writeCache(key, data) {
        const dataForCache = JSON.stringify(data);
        try {
            await _cacheserver.redisClient.set(key, dataForCache);
            _cacheserver.redisClient.expire(key, 60 * 60 * 24); // 24 hours
        } catch (error) {
            console.error(error);
        }
    }
    async singleKeyDelete(key) {
        await _cacheserver.redisClient.del(key);
    }
    async multiKeyDelete(keys) {
        if (keys.length > 0) {
            await _cacheserver.redisClient.del(keys);
        }
    }
    reqToKey(req) {
        const url = new URL(`${process.env.SHOPIFY_APP_URL}${req.originalUrl}`);
        const searchParams = url.searchParams;
        searchParams.delete("signature");
        searchParams.delete("timestamp");
        const reqDataToHash = {
            query: searchParams.toString(),
            body: req.body
        };
        // `${req.path}@...` to make it easier to find
        // keys on a Redis client
        return `${req.path}@${_objecthash.default.sha1(reqDataToHash)}`;
    }
};

//# sourceMappingURL=cache.service.js.map