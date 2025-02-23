import { createClient } from "redis";

//Redis client for caching

const client = createClient({
    url: process.env.REDIS_URL,
    socket: {
        reconnectStrategy: function (retries) {
            if (retries > 20) {
                console.log("Too many attempts to reconnect. Redis connection was terminated");
                return new Error("Too many retries.");
            } else {
                return retries * 500;
            }
        },
    },
});
client.on("error", (error) => console.error("Redis client error:", error));

(async () => {
    await client.connect();
})();

export const redisClient = client;
