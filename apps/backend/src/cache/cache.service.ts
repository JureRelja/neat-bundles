import { redisClient } from "./cache.server";
import { Request } from "express";
import hash from "object-hash";
import { CacheData } from "./dto/cache-data.dto";

export class CacheService {
    public async readCache(key: string): Promise<CacheData | null> {
        const data = await redisClient.get(key);

        if (data) {
            return JSON.parse(data);
        }
        return null;
    }

    public async writeCache(key: string, data: unknown): Promise<void> {
        const dataForCache = JSON.stringify(data);

        try {
            await redisClient.set(key, dataForCache);
            redisClient.expire(key, 60 * 60 * 24); // 24 hours
        } catch (error) {
            console.error(error);
        }
    }

    public async singleKeyDelete(key: string): Promise<void> {
        await redisClient.del(key);
    }

    public async multiKeyDelete(keys: string[]): Promise<void> {
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
    }

    public reqToKey(req: Request): string {
        const url = new URL(`${process.env.SHOPIFY_APP_URL as string}${req.originalUrl}`);

        const searchParams = url.searchParams;

        searchParams.delete("signature");
        searchParams.delete("timestamp");

        const reqDataToHash = {
            query: searchParams.toString(),
            body: req.body,
        };

        // `${req.path}@...` to make it easier to find
        // keys on a Redis client
        return `${req.path}@${hash.sha1(reqDataToHash)}`;
    }
}
