import { AdminApiContext } from '@shopify/shopify-app-remix/server';
import { unauthenticated } from '../../shopify.server';
import { AddedProductVariantDto } from '~/dto/AddedProductVariantDto';

export class ShopifyProductVariantService {
    private admin: AdminApiContext;

    constructor(admin: AdminApiContext) {
        this.admin = admin;
    }

    static async build(shop: string) {
        const { admin } = await unauthenticated.admin(shop);
        return new ShopifyProductVariantService(admin);
    }

    //Get the price of the product variant
    public async getProductVariantPrice(productVariantId: string): Promise<number> {
        const response = await this.admin.graphql(
            `#graphql
            query getProductVariantPrice($productId: ID!) {
                productVariant(id: $productId) {
                    price
                }
            }`,
            {
                variables: {
                    productId: productVariantId,
                },
            },
        );

        const data = await response.json();

        return data.data.productVariant.price;
    }

    //Create a new product variant
    public async createProductVariant(createdBundleId: number, bundleTitle: string, shopifyProductId: string, compareAtPrice: number, price: number): Promise<string> {
        const response = await this.admin.graphql(
            `#graphql
            mutation createProductVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
                productVariantsBulkCreate(productId: $productId, variants: $variants) {
                    productVariants {
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
                    productId: shopifyProductId,
                    variants: [
                        {
                            compareAtPrice: compareAtPrice,
                            price: price,
                            optionValues: [
                                {
                                    optionName: 'Title',
                                    name: `Bundle #${createdBundleId}`,
                                },
                            ],
                        },
                    ],
                },
            },
        );

        return (await response.json()).data.productVariantsBulkCreate.productVariants[0].id;
    }

    //Update the product variant relationship
    public async updateProductVariantRelationship(variantId: string, addedProductVariants: AddedProductVariantDto[]): Promise<boolean> {
        const response = await this.admin.graphql(
            `#graphql
          mutation CreateBundle($input: [ProductVariantRelationshipUpdateInput!]!) {
            productVariantRelationshipBulkUpdate(input: $input) {
              parentProductVariants {
                id
                productVariantComponents(first: 10) {
                  nodes {
                    id
                    productVariant {
                      id
                      displayName
                    }
                  }
                }
              }
              userErrors {
                code
                field
                message
              }
            }
          }`,
            {
                variables: {
                    input: [
                        {
                            parentProductVariantId: variantId,
                            productVariantRelationshipsToCreate: addedProductVariants.map((addedProductVariant) => {
                                return { id: addedProductVariant.productVariant, quantity: addedProductVariant.quantity };
                            }),
                        },
                    ],
                },
            },
        );

        const data = await response.json();

        if (data.data.productVariantRelationshipBulkUpdate.userErrors.length && data.data.productVariantRelationshipBulkUpdate.userErrors.length > 0) {
            return false;
        }

        return true;
    }
}
