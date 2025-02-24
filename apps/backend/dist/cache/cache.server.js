"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "redisClient", {
    enumerable: true,
    get: function() {
        return redisClient;
    }
});
const _redis = require("redis");
const _dotenv = require("dotenv");
const _path = require("path");
// Load .env from backend directory
(0, _dotenv.config)({
    path: (0, _path.resolve)(__dirname, "../../.env")
});
//Redis client for caching
const client = (0, _redis.createClient)({
    url: process.env.REDIS_URL
});
client.on("error", (error)=>console.error("Redis client error:", error));
(async ()=>{
    await client.connect();
})();
const redisClient = client;

//# sourceMappingURL=cache.server.js.map