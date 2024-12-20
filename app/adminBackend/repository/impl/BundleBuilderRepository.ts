import { Page } from "~/adminBackend/shopifyGraphql/graphql";
import db from "../../../db.server";
import { BundleBuilder } from "@prisma/client";
import { BundleBuilderAndBundleSteps, bundleBuilderAndBundleSteps } from "@adminBackend/model/BundleBuilderAndBundleSteps";
export class BundleBuilderRepository {
    public static async createNewBundleBuilder(shop: string, bundleTitle: string, bundleProductId: string, bundlePageId: string, bundleBuilderPageHandle: string) {
        //Create a new bundle in the database
        const bundle = await db.bundleBuilder.create({
            data: {
                user: {
                    connect: {
                        storeUrl: shop,
                    },
                },
                title: bundleTitle,
                published: true,
                shopifyProductId: bundleProductId,
                shopifyPageId: bundlePageId,
                pricing: "CALCULATED",
                discountType: "PERCENTAGE",
                discountValue: 10,
                bundleSettings: {
                    create: {
                        hidePricingSummary: false,
                        skipTheCart: false,
                        allowBackNavigation: true,
                        showOutOfStockProducts: false,
                    },
                },
                bundleBuilderPageHandle: bundleBuilderPageHandle,
                steps: {
                    create: [
                        {
                            stepNumber: 1,
                            title: "Step 1",
                            stepType: "PRODUCT",
                            description: "This is a description for Step 1",
                            productInput: {
                                create: {
                                    minProductsOnStep: 1,
                                    maxProductsOnStep: 3,
                                    allowProductDuplicates: false,
                                    showProductPrice: true,
                                },
                            },
                            contentInputs: {
                                create: [
                                    {
                                        inputType: "TEXT",
                                        inputLabel: "Enter text",
                                        maxChars: 50,
                                        required: true,
                                    },
                                    {
                                        inputLabel: "",
                                        maxChars: 0,
                                        required: false,
                                        inputType: "NONE",
                                    },
                                ],
                            },
                        },
                        {
                            stepNumber: 2,
                            title: "Step 2",
                            description: "This is a description for Step 2",

                            stepType: "PRODUCT",
                            productInput: {
                                create: {
                                    minProductsOnStep: 1,
                                    maxProductsOnStep: 3,
                                    allowProductDuplicates: false,
                                    showProductPrice: true,
                                },
                            },
                            contentInputs: {
                                create: [
                                    {
                                        inputType: "TEXT",
                                        inputLabel: "Enter text",
                                        maxChars: 50,
                                        required: true,
                                    },
                                    {
                                        inputLabel: "",
                                        maxChars: 0,
                                        required: false,
                                        inputType: "NONE",
                                    },
                                ],
                            },
                        },
                        {
                            stepNumber: 3,
                            title: "Step 3",
                            description: "This is a description for Step 3",

                            stepType: "PRODUCT",
                            productInput: {
                                create: {
                                    minProductsOnStep: 1,
                                    maxProductsOnStep: 3,
                                    allowProductDuplicates: false,
                                    showProductPrice: true,
                                },
                            },
                            contentInputs: {
                                create: [
                                    {
                                        inputType: "TEXT",
                                        inputLabel: "Enter text",
                                        maxChars: 50,
                                        required: true,
                                    },
                                    {
                                        inputLabel: "",
                                        maxChars: 0,
                                        required: false,
                                        inputType: "NONE",
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        });

        return bundle;
    }

    public static async createNewEmptyBundleBuilder(shop: string, bundleTitle: string, bundleProductId: string, bundlePageId: string, bundleBuilderPageHandle: string) {
        //Create a new bundle in the database
        const bundleBuilder = await db.bundleBuilder.create({
            data: {
                user: {
                    connect: {
                        storeUrl: shop,
                    },
                },
                title: bundleTitle,
                published: true,
                shopifyProductId: bundleProductId,
                shopifyPageId: bundlePageId,
                bundleBuilderPageHandle: bundleBuilderPageHandle,
                pricing: "CALCULATED",
                discountType: "PERCENTAGE",
                discountValue: 10,
                bundleSettings: {
                    create: {
                        hidePricingSummary: false,
                        skipTheCart: false,
                        allowBackNavigation: true,
                        showOutOfStockProducts: false,
                    },
                },
            },
        });

        return bundleBuilder;
    }

    public async getAllActiveBundleBuilders(storeUrl: string): Promise<BundleBuilder[] | null> {
        return db.bundleBuilder.findMany({
            where: {
                storeUrl: storeUrl,
                deleted: false,
            },
        });
    }

    public async getFirstActiveBundleBuilder(storeUrl: string): Promise<BundleBuilder | null> {
        return db.bundleBuilder.findFirst({
            where: {
                storeUrl: storeUrl,
                deleted: false,
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

    public static async updateBundleBuilderProductId(bundleBuilderId: number, productId: string) {
        await db.bundleBuilder.update({
            where: {
                id: bundleBuilderId,
            },
            data: {
                shopifyProductId: productId,
            },
        });
    }

    public static async updateBundleBuilderPage(bundleBuilderId: number, newPage: Page) {
        await db.bundleBuilder.update({
            where: {
                id: bundleBuilderId,
            },
            data: {
                shopifyPageId: newPage.id,
                bundleBuilderPageHandle: newPage.handle,
            },
        });
    }

    public static async getMaxBundleBuilderId(shop: string) {
        const { _max }: { _max: { id: number | null } } = await db.bundleBuilder.aggregate({
            _max: {
                id: true,
            },
            where: {
                storeUrl: shop,
            },
        });

        return _max.id;
    }

    public async getBundleBuilderCountByStoreUrl(storeUrl: string): Promise<number> {
        return db.bundleBuilder.count({
            where: {
                storeUrl: storeUrl,
                deleted: false,
            },
        });
    }

    public async getBundleBuilderByIdAndStoreUrl(id: number, storeUrl: string): Promise<BundleBuilder | null> {
        return db.bundleBuilder.findUnique({
            where: {
                id: id,
                storeUrl: storeUrl,
                deleted: false,
            },
        });
    }

    public async getAllBundleBuilderAndBundleSteps(storeUrl: string): Promise<BundleBuilderAndBundleSteps[] | null> {
        const bundleBuilders: BundleBuilderAndBundleSteps[] = await db.bundleBuilder.findMany({
            where: {
                user: {
                    storeUrl: storeUrl,
                },
                deleted: false,
            },
            include: bundleBuilderAndBundleSteps,
            orderBy: {
                createdAt: "desc",
            },
        });

        return bundleBuilders;
    }

    public async getAllBundleBuilderAndBundleStepsAsc(storeUrl: string): Promise<BundleBuilderAndBundleSteps[] | null> {
        const bundleBuilders: BundleBuilderAndBundleSteps[] = await db.bundleBuilder.findMany({
            where: {
                user: {
                    storeUrl: storeUrl,
                },
                deleted: false,
            },
            include: bundleBuilderAndBundleSteps,
            orderBy: {
                createdAt: "asc",
            },
        });

        return bundleBuilders;
    }

    public async deleteBundleBuilderById(id: number): Promise<undefined> {
        await db.bundleBuilder.update({
            where: {
                id: id,
            },
            data: {
                deleted: true,
            },
        });
    }
}

const bundleBuilderRepository = new BundleBuilderRepository();

export default bundleBuilderRepository;
