import { redisClient } from "~/shopify.server";

export async function ReadCache(key: string): Promise<unknown | null> {
  const data = await redisClient.get(key);
  if (data) {
    return JSON.parse(data);
  }
  return null;
}

export async function WriteCache(key: string, data: unknown): Promise<void> {
  const dataForCache = JSON.stringify(data);

  await redisClient.set(key, dataForCache);
  redisClient.expire(key, 60 * 60 * 24); // 24 hours
}
