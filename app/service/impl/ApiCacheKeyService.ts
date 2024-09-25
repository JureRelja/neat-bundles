import db from '../../db.server';

export enum ApiEndpoint {
    BundleData = 'bundleData',
    BundleSettings = 'bundleData/settings',
    BundleStep = 'bundleData/step',
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

    public getBundleDataKey(bundleBuilderId: string | null): string {
        if (bundleBuilderId === null) {
            return '';
        }

        return `api-${this.shop}-${ApiEndpoint.BundleData}-${bundleBuilderId}`;
    }

    public getBundleSettingsKey(bundleBuilderId: string | null): string {
        if (bundleBuilderId === null) {
            return '';
        }

        return `api-${this.shop}-${ApiEndpoint.BundleSettings}-${bundleBuilderId}`;
    }

    public getStepKey(stepNum: string | null, bundleBuilderId: string | null): string {
        if (stepNum === null) {
            return '';
        }

        return `api-${this.shop}-${ApiEndpoint.BundleStep}-${bundleBuilderId}-${stepNum}`;
    }

    public async getAllStepsKeys(bundleBuilderId: string | null): Promise<string[]> {
        if (bundleBuilderId === null) {
            return [];
        }

        // Get the number of steps in the bundle
        const numOfSteps = await db.bundleStep.aggregate({
            _count: {
                stepNumber: true,
            },
            where: {
                bundleBuilderId: Number(bundleBuilderId),
            },
        });

        if (numOfSteps === null) {
            return [];
        }
        const keys: string[] = [];

        //Generate keys for each step
        for (let i = 1; i <= numOfSteps._count.stepNumber; i++) {
            const key = this.getStepKey(String(i), bundleBuilderId);
            keys.push(key);
        }

        return keys;
    }

    public async getAllBundleKeys(bundleBuilderId: string | null): Promise<string[]> {
        if (bundleBuilderId === null) {
            return [];
        }

        const keys: string[] = [];

        keys.push(this.getBundleDataKey(bundleBuilderId));
        keys.push(this.getBundleSettingsKey(bundleBuilderId));
        keys.push(...(await this.getAllStepsKeys(bundleBuilderId)));

        return keys;
    }
}
