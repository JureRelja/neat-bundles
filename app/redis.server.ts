import { createClient } from "redis";

//Redis client for caching
let redis = createClient({
    url: process.env.REDIS_URL,
});

redis.on("connect", () => {
    console.log(`Redis client connected`);
});

redis.on("error", (error: String) => {
    console.error(`Redis client error:`, error);
});

//Exporting redis
export const redisClient = redis;
