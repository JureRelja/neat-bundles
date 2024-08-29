import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { sessionHandler, commitSession } from "../store.sessions";
import { redisClient, unauthenticated } from "~/shopify.server";
import db from "~/db.server";
import { JsonData } from "~/types/jsonData";
import { checkPublicAuth } from "~/utils/publicApi.auth";
import { ReadCache, WriteCache } from "~/routes/cache";
import { ProductResourceType } from "@prisma/client";
import {
  ProductResponse,
  CollectionProductResponse,
  Product,
} from "~/types/Product";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  const storeUrl = url.searchParams.get("storeUrl");
  const bundleId = url.searchParams.get("bundleId");
  const productStepId = url.searchParams.get("productStepId");

  await checkPublicAuth(storeUrl, bundleId); //Public auth check

  // Check if productStepId is provided
  if (!productStepId) {
    return json(
      new JsonData(
        false,
        "error",
        "There was an error with your request. 'productStepId' wasn't specified.",
      ),
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        status: 200,
      },
    );
  }

  //Cache aside
  const key = `${url}/${storeUrl}/${bundleId}/${productStepId}`;
  const cacheData = await ReadCache(key);

  if (cacheData) {
    //Cache hit
    return json(
      new JsonData(
        true,
        "success",
        "Products were succesfuly retrieved.",
        [],
        cacheData,
      ),
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        status: 200,
      },
    );
  } else {
    //Cache miss

    // Get shopify product links
    const productsData: {
      productResources: String[] | null;
      resourceType: ProductResourceType;
    } | null = await db.productsData.findUnique({
      where: {
        id: Number(productStepId),
      },
      select: {
        productResources: true,
        resourceType: true,
      },
    });

    // Return if no products were found
    if (!productsData?.productResources) {
      return json(
        new JsonData(
          false,
          "error",
          "There was an error with your request. Products for the entered 'productStepId' weren't found.",
        ),
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
          status: 200,
        },
      );
    }

    // Get products data from Shopify
    const { storefront } = await unauthenticated.storefront(storeUrl as string);

    let products: (Product | null)[] = [];

    if (productsData.resourceType === ProductResourceType.PRODUCT) {
      //Fethching specific products
      products = await Promise.all(
        productsData.productResources.map(
          async (productId): Promise<Product | null> => {
            const response = await storefront.graphql(
              `#graphql
                query getProductById($id: ID!, $numOfVariants: Int) {
                  product (id: $id) {
                    availableForSale
                    title
                    featuredImage {
                      url
                    }
                    descriptionHtml
                    variants(first: $numOfVariants) {
                      nodes {
                        price {
                          currencyCode
                          amount
                        }
                        image {
                          url
                        }
                      }
                    }
                  }
                }`,
              {
                variables: {
                  id: productId,
                  numOfVariants: 100,
                },
              },
            );
            const data = response.json() as unknown as ProductResponse;

            return data.data.product;
          },
        ),
      );
    } else if (productsData.resourceType === ProductResourceType.COLLECTION) {
      //Fetching specific collections
      const collectionProducts: (Product[] | null)[] = await Promise.all(
        productsData.productResources.map(
          async (collectionId): Promise<Product[] | null> => {
            const response = await storefront.graphql(
              `#graphql
                query getCollectionById($id: ID!, $numOfVariants: Int) {
                  collection(id: $id) {
                    products (first: 20) {
                      nodes {
                        availableForSale
                        title
                        featuredImage {
                          url
                        }
                        descriptionHtml
                        variants (first: $numOfVariants) {
                          nodes {
                            title
                            price {
                              amount
                              currencyCode
                            }
                          }
                        }
                      }
                    }
                  }
              }`,
              {
                variables: {
                  id: collectionId,
                  numOfVariants: 100,
                },
              },
            );
            const data =
              response.json() as unknown as CollectionProductResponse;

            return data.data.collection.products.nodes;
          },
        ),
      );
      products = collectionProducts.flat();
    }

    return json(
      new JsonData(
        false,
        "success",
        "Your request was succesfull",
        [],
        productsData,
      ),
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        status: 200,
      },
    );
  }
};

export const action = async ({ request }: LoaderFunctionArgs) => {
  const session = await sessionHandler(request);
};
