import db from "@db/server";
import type { BundleBuilder } from "@db/server";
import type { BundleBuilderAndBundleSteps } from "@adminBackend/model/BundleBuilderAndBundleSteps";
import { bundleBuilderAndBundleSteps } from "@adminBackend/model/BundleBuilderAndBundleSteps";
export class BundleBuilderRepository {
    public async create(shop: string, title: string, productId: string): Promise<BundleBuilder> {
        const bundleBuilder: BundleBuilder = await db.bundleBuilder.create({
            data: {
                shop: shop,
                title: title,
                published: true,
                shopifyProductId: productId,
                bundleBuilderConfig: {
                    create: {
                        skipTheCart: false,
                        allowBackNavigation: true,
                        showOutOfStockProducts: false,
                    },
                },
            },
        });

        return bundleBuilder;
    }

    // public async getFirstActiveBundleBuilder(storeUrl: string): Promise<BundleBuilder | null> {
    //     return db.bundleBuilder.findFirst({
    //         where: {
    //             storeUrl: storeUrl,
    //             deleted: false,
    //         },
    //     });
    // }

    public static updateBundleBuilderProductId(id: number, productId: string) {
        return db.bundleBuilder.update({
            where: {
                id: id,
            },
            data: {
                shopifyProductId: productId,
            },
        });
    }

    public static async getBundleBuilderById(bundleBuilderId: number) {
        return db.bundleBuilder.findUnique({
            where: {
                id: bundleBuilderId,
            },
        });
    }

    public async getAllBundleBuilderAndBundleSteps(storeUrl: string): Promise<BundleBuilderAndBundleSteps[] | null> {
        const bundleBuilders: BundleBuilderAndBundleSteps[] = await db.bundleBuilder.findMany({
            where: {
                shop: storeUrl,
            },
            include: bundleBuilderAndBundleSteps,
            orderBy: {
                createdAt: "asc",
            },
        });

        return bundleBuilders;
    }

    public async getAllBundleBuilderAndBundleStepsAsc(storeUrl: string): Promise<BundleBuilderAndBundleSteps[] | null> {
        const bundleBuilders: BundleBuilderAndBundleSteps[] = await db.bundleBuilder.findMany({
            where: {
                shop: storeUrl,
            },
            include: bundleBuilderAndBundleSteps,
            orderBy: {
                createdAt: "asc",
            },
        });

        return bundleBuilders;
    }

    public async deleteBundleBuilderById(id: number): Promise<undefined> {
        await db.bundleBuilder.delete({
            where: {
                id: id,
            },
        });
    }

    public async deleteBundles(bundlesForDeleting: number[]): Promise<undefined> {
        await db.bundleBuilder.deleteMany({
            where: {
                id: {
                    in: bundlesForDeleting,
                },
            },
        });
    }

    public async delete(id: number): Promise<BundleBuilder | null> {
        return await db.bundleBuilder.update({
            where: {
                id: id,
            },
            data: {},
        });
    }

    public async get(id: number, shop: string): Promise<BundleBuilder | null> {
        return db.bundleBuilder.findUnique({
            where: {
                id: id,
                shop: shop,
            },
        });
    }

    async getWithSteps(id: number, shop: string): Promise<BundleBuilderAndBundleSteps | null> {
        return await db.bundleBuilder.findUnique({
            where: {
                id: id,
                shop: shop,
            },
            include: bundleBuilderAndBundleSteps,
        });
    }

    public async getAll(shop: string): Promise<BundleBuilder[]> {
        return db.bundleBuilder.findMany({
            where: {
                shop: shop,
            },
        });
    }

    public async getCount(shop: string): Promise<number> {
        return db.bundleBuilder.count({
            where: {
                shop: shop,
            },
        });
    }
}

const bundleBuilderRepository = new BundleBuilderRepository();

export default bundleBuilderRepository;
