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
//Redis client for caching
const client = (0, _redis.createClient)({
    url: process.env.REDIS_URL,
    socket: {
        reconnectStrategy: function(retries) {
            if (retries > 20) {
                console.log("Too many attempts to reconnect. Redis connection was terminated");
                return new Error("Too many retries.");
            } else {
                return retries * 500;
            }
        }
    }
});
client.on("error", (error)=>console.error("Redis client error:", error));
(async ()=>{
    await client.connect();
})();
const redisClient = client;

//# sourceMappingURL=cache.server.js.map