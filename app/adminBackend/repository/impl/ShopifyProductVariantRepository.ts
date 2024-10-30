import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { AddedProductVariantDto } from "app/adminBackend/service/dto/AddedProductVariantDto";
import { PriceCalculationType } from "~/adminBackend/shopifyGraphql/graphql";

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
                            compareAtPrice: compareAtPrice,
                            optionValues: [
                                {
                                    optionName: "Title",
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
            throw Error("There was an error creating a bundle builder product variant.");
        }

        const productVariantId = data.productVariantsBulkCreate.productVariants[0].id;

        return productVariantId;
    }

    //Update the product variant relationship
    public async updateProductVariantRelationship(admin: AdminApiContext, variantId: string, addedProductVariants: AddedProductVariantDto[], price: number): Promise<boolean> {
        const response = await admin.graphql(
            `#graphql
          mutation addVariantsToBundleProductVariant($input: [ProductVariantRelationshipUpdateInput!]!) {
            productVariantRelationshipBulkUpdate(input: $input) {
              parentProductVariants {
                id
                price
                compareAtPrice
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
                            priceInput: {
                                calculation: PriceCalculationType.Fixed,
                                price: price,
                            },
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

        console.log(data.data.productVariantRelationshipBulkUpdate);
        console.log(data.data.productVariantRelationshipBulkUpdate.parentProductVariants);

        return true;
    }
}

export const shopifyProductVariantRepository = new ShopifyProductVariantRepository();
