import { redisClient } from "~/shopify.server";

export enum ApiEndpoint {
  BundleData = "bundleData",
  BundleStep = "bundleStep",
  BundleSettings = "bundleSettings",
}

export class Cache {
  private key: string;

  public constructor(request: Request, apiEndpoint: ApiEndpoint) {
    const url = new URL(request.url);

    // Get query params
    const bundleId = url.searchParams.get("bundleId");
    const stepNumber = url.searchParams.get("stepNum");
    const storeUrl = url.searchParams.get("shop");

    if (apiEndpoint === ApiEndpoint.BundleData) {
      this.key = `api/${storeUrl}/bundleData/${bundleId}`;
    } else if (apiEndpoint === ApiEndpoint.BundleStep) {
      this.key = `api/${storeUrl}/bundleData/${bundleId}/step/${stepNumber}`;
    } else if (apiEndpoint === ApiEndpoint.BundleSettings) {
      this.key = `api/${storeUrl}/bundleData/${bundleId}/settings`;
    } else {
      throw new Error("Invalid API endpoint");
    }
  }

  public async readCache(): Promise<unknown | null> {
    const data = await redisClient.get(this.key);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  }

  public async writeCache(data: unknown): Promise<void> {
    const dataForCache = JSON.stringify(data);

    await redisClient.set(this.key, dataForCache);
    redisClient.expire(this.key, 60 * 60 * 24); // 24 hours
  }
}
