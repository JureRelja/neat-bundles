import db from '../../db.server';

export class BundleRepository {
    public static async createNewBundleBuilder(shop: string, bundleTitle: string, bundleProductId: string, bundlePageId: string) {
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
                pricing: 'CALCULATED',
                discountType: 'PERCENTAGE',
                discountValue: 10,
                bundleSettings: {
                    create: {
                        displayDiscountBanner: false,
                        skipTheCart: false,
                        allowBackNavigation: true,
                        showOutOfStockProducts: false,
                        bundleColors: {
                            create: {
                                addToBundleBtn: '#000000',
                                addToBundleText: '#000000',
                                removeProductsBtn: '#000000',
                                removeProductsBtnText: '#000000',
                                stepsIcon: '#000000',
                                nextStepBtn: '#000000',
                                nextStepBtnText: '#000000',
                                titleAndDESC: '#000000',
                                prevStepBtnText: '#000000',
                                viewProductBtn: '#000000',
                                viewProductBtnText: '#000000',
                                prevStepBtn: '#000000',
                            },
                        },
                        bundleLabels: {
                            create: {
                                addToBundleBtn: 'Add to bundle',
                                prevStepBtn: 'Previous step',
                                nextStepBtn: 'Next step',
                                viewProductBtn: 'View product',
                            },
                        },
                    },
                },
                steps: {
                    create: [
                        {
                            stepNumber: 1,
                            title: 'Step 1',
                            stepType: 'PRODUCT',
                            description: 'This is a description for Step 1',
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
                                        inputType: 'TEXT',
                                        inputLabel: 'Enter text',
                                        maxChars: 50,
                                        required: true,
                                    },
                                    {
                                        inputLabel: '',
                                        maxChars: 0,
                                        required: false,
                                        inputType: 'NONE',
                                    },
                                ],
                            },
                        },
                        {
                            stepNumber: 2,
                            title: 'Step 2',
                            description: 'This is a description for Step 2',

                            stepType: 'PRODUCT',
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
                                        inputType: 'TEXT',
                                        inputLabel: 'Enter text',
                                        maxChars: 50,
                                        required: true,
                                    },
                                    {
                                        inputLabel: '',
                                        maxChars: 0,
                                        required: false,
                                        inputType: 'NONE',
                                    },
                                ],
                            },
                        },
                        {
                            stepNumber: 3,
                            title: 'Step 3',
                            description: 'This is a description for Step 3',

                            stepType: 'PRODUCT',
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
                                        inputType: 'TEXT',
                                        inputLabel: 'Enter text',
                                        maxChars: 50,
                                        required: true,
                                    },
                                    {
                                        inputLabel: '',
                                        maxChars: 0,
                                        required: false,
                                        inputType: 'NONE',
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        });

        return bundle.id;
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
}
