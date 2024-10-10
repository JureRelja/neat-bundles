import { AdminApiContext } from '@shopify/shopify-app-remix/server';
import { BundleDiscountType } from '@prisma/client';

class ShopifyDiscountRepository {
    constructor() {}

    public async createDiscount(admin: AdminApiContext, shopifyProductId: string, discountType: BundleDiscountType, discountValue: number): Promise<boolean> {
        const response = await admin.graphql(
            `#graphql
            mutation createBundleBuilderDiscount($automaticBxgyDiscount: DiscountAutomaticBxgyInput!) {
            discountAutomaticBxgyCreate(automaticBxgyDiscount: $automaticBxgyDiscount) {
                automaticDiscountNode {
                    id
                }
                userErrors {
                    field
                    message
                }
            }
            }`,
            {
                variables: {
                    automaticBxgyDiscount: {
                        combinesWith: {
                            orderDiscounts: true,
                            productDiscounts: true,
                            shippingDiscounts: true,
                        },
                        customerBuys: {
                            items: {
                                products: {
                                    productsToAdd: [
                                        {
                                            id: shopifyProductId,
                                        },
                                    ],
                                },
                            },
                            value: {
                                quantity: 1,
                            },
                        },
                        customerGets: {
                            items: {
                                products: {
                                    productsToAdd: [
                                        {
                                            id: shopifyProductId,
                                        },
                                    ],
                                },
                            },
                            value: {
                                discountAmount: {
                                    amount: discountType === 'FIXED' ? discountValue : 0,
                                },
                                percentage: discountType === 'PERCENTAGE' ? discountValue : 0,
                            },
                        },
                    },
                },
            },
        );
    }
}

export const shopifyDiscountRepository = new ShopifyDiscountRepository();
