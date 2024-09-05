import db from "../db.server";

export enum ApiEndpoint {
  BundleData = "bundleData",
  BundleSettings = "bundleData/settings",
  BundleStep = "bundleData/step",
}

export class ApiCacheKeyService {
  private key: string | null = null;
  private shop: String;

  public constructor(shop: string) {
    this.shop = shop;
  }

  public getKey(): string | null {
    return this.key;
  }

  public getBundleDataKey(bundleId: string | null): string {
    if (bundleId === null) {
      return "";
    }

    return `api-${this.shop}-${ApiEndpoint.BundleData}-${bundleId}`;
  }

  public getBundleSettingsKey(bundleId: string | null): string {
    if (bundleId === null) {
      return "";
    }

    return `api-${this.shop}-${ApiEndpoint.BundleSettings}-${bundleId}`;
  }

  public getStepKey(stepNum: string | null): string {
    if (stepNum === null) {
      return "";
    }

    return `api-${this.shop}-${ApiEndpoint.BundleStep}-${stepNum}`;
  }

  public async getAllStepsKeys(bundleId: string | null): Promise<string[]> {
    if (bundleId === null) {
      return [];
    }

    // Get the number of steps in the bundle
    const numOfSteps = await db.bundleStep.aggregate({
      _count: {
        stepNumber: true,
      },
      where: {
        bundleId: Number(bundleId),
      },
    });

    if (numOfSteps === null) {
      return [];
    }
    const keys: string[] = [];

    //Generate keys for each step
    for (let i = 1; i <= numOfSteps._count.stepNumber; i++) {
      const key = this.getStepKey(String(i));
      keys.push(key);
    }

    return keys;
  }

  public async getAllBundleKeys(bundleId: string | null): Promise<string[]> {
    if (bundleId === null) {
      return [];
    }

    const keys: string[] = [];

    keys.push(this.getBundleDataKey(bundleId));
    keys.push(this.getBundleSettingsKey(bundleId));
    keys.push(...(await this.getAllStepsKeys(bundleId)));

    return keys;
  }
}
