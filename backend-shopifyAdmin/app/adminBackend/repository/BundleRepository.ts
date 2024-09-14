import db from '../../db.server';

export class BundleRepository {
    public static async createNewBundle(shop: string, bundleTitle: string, bundleProductId: string, bundlePageId: string) {
        //Create a new bundle in the database
        const bundle = await db.bundle.create({
            data: {
                user: {
                    connect: {
                        storeUrl: shop,
                    },
                },
                title: bundleTitle,
                shopifyProductId: bundleProductId,
                shopifyPageId: bundlePageId,
                bundleSettings: {
                    create: {
                        bundleColors: {
                            create: {},
                        },
                        bundleLabels: {
                            create: {},
                        },
                    },
                },
                steps: {
                    create: [
                        {
                            stepNumber: 1,
                            title: 'Step 1',
                            stepType: 'PRODUCT',
                            productInput: {
                                create: {},
                            },
                            contentInputs: {
                                create: [{}, {}],
                            },
                        },
                        {
                            stepNumber: 2,
                            title: 'Step 2',
                            stepType: 'PRODUCT',
                            productInput: {
                                create: {},
                            },
                            contentInputs: {
                                create: [{}, {}],
                            },
                        },
                        {
                            stepNumber: 3,
                            title: 'Step 3',
                            stepType: 'PRODUCT',
                            productInput: {
                                create: {},
                            },
                            contentInputs: {
                                create: [{}, {}],
                            },
                        },
                    ],
                },
            },
        });

        return bundle.id;
    }

    public static async getMaxBundleId(shop: string) {
        const { _max }: { _max: { id: number | null } } = await db.bundle.aggregate({
            _max: {
                id: true,
            },
            where: {
                storeUrl: shop,
            },
        });

        return _max.id;
    }
}
