import { AdminApiContext } from '@shopify/shopify-app-remix/server';
import { AddedProductVariantDto } from '@adminBackend/service/dto/AddedProductVariantDto';

export class ShopifyProductVariantRepository {
    constructor() {}

    //Get the price of the product variant
    public async getProductVariantPrice(admin: AdminApiContext, productVariantId: string): Promise<number> {
        const response = await admin.graphql(
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

        return parseFloat(data.data.productVariant.price);
    }

    //Create a new product variant
    public async createProductVariant(admin: AdminApiContext, createdBundleId: number, shopifyProductId: string, compareAtPrice: number, price: number): Promise<string> {
        const response = await admin.graphql(
            `#graphql
            mutation createProductVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
                productVariantsBulkCreate(productId: $productId, variants: $variants) {
                    productVariants {
                        id
                        compareAtPrice
                        price
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

        const data = (await response.json()).data;

        if (data.productVariantsBulkCreate.userErrors > 0) {
            console.log(data.productVariantsBulkCreate.userErrors);
            throw Error('There was an error creating a bundle builder product variant.');
        }

        const productVariantId = data.productVariantsBulkCreate.productVariants[0].id;

        console.log(price, compareAtPrice);
        console.log(data.productVariantsBulkCreate.productVariants);

        return productVariantId;
    }

    //Update the product variant relationship
    public async updateProductVariantRelationship(admin: AdminApiContext, variantId: string, addedProductVariants: AddedProductVariantDto[]): Promise<boolean> {
        const response = await admin.graphql(
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

export const shopifyProductVariantRepository = new ShopifyProductVariantRepository();
