// import { redisClient } from "../../../shopify.server";

// export class ApiCacheService {
//     private key: string;

//     public constructor(key: string) {
//         this.key = key;
//     }

//     public async readCache(): Promise<unknown | null> {
//         const data = await redisClient.get(this.key);
//         if (data) {
//             return JSON.parse(data);
//         }
//         return null;
//     }

//     public async writeCache(data: unknown): Promise<void> {
//         const dataForCache = JSON.stringify(data);

//         await redisClient.set(this.key, dataForCache);
//         redisClient.expire(this.key, 60 * 60 * 24); // 24 hours
//     }

//     public static async singleKeyDelete(key: string): Promise<void> {
//         await redisClient.del(key);
//     }

//     public static async multiKeyDelete(keys: string[]): Promise<void> {
//         if (keys.length > 0) {
//             await redisClient.del(keys);
//         }
//     }
// }
