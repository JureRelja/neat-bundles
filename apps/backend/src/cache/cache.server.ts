import { createClient } from "redis";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env from backend directory
config({ path: resolve(__dirname, "../../.env") });

//Redis client for caching
const client = createClient({
    url: process.env.REDIS_URL,
});
client.on("error", (error) => console.error("Redis client error:", error));

(async () => {
    await client.connect();
})();

export const redisClient = client;
