import { createAdminApiClient } from "@shopify/admin-api-client";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import db from "~/db.server";
import { JsonData } from "~/types/jsonData";
import { checkPublicAuth } from "~/utils/publicApi.auth";
import { FileStoreService } from "../../service/FileStoreService";
import { FileStoreServiceImpl } from "~/service/impl/FIleStoreServiceImpl";
import {
  BundleFullAndStepsFullDto,
  bundleFullStepsFull,
} from "~/dto/BundleFullAndStepsFullDto";
import { CustomerInput } from "../../dto/CustomerInputDto";
import { ProductDto } from "~/dto/ProductDto";
import { ContentDto } from "~/dto/ContentDto";
import { redisClient, unauthenticated } from "~/shopify.server";
import { apiVersion } from "~/shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const res = await checkPublicAuth(request); //Public auth check

  if (!res.ok)
    return json(res, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      status: 200,
    });

  //Get query params
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") as string;
  const bundleId = url.searchParams.get("bundleId");

  try {
    const formData = await request.formData();

    //Get the customer inputs
    const customerInputs: CustomerInput[] = JSON.parse(
      formData.get("customerInputs") as string,
    ) as CustomerInput[];

    //Get the files
    const files: File | File[] | null = formData.get("files") as
      | File
      | File[]
      | null;

    if (!customerInputs) {
      return json(new JsonData(true, "error", "Invalid form data.", []), {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        status: 400,
      });
    }

    //Check if all bundle conditions are met

    //Get the bundle with all the steps
    const bundle: BundleFullAndStepsFullDto = (await db.bundle.findUnique({
      where: {
        id: Number(bundleId as string),
      },
      include: bundleFullStepsFull,
    })) as BundleFullAndStepsFullDto;

    let error = false;

    //Check conditions for each step
    bundle.steps.forEach((step) => {
      const customerInputsOnThisStep = customerInputs.find(
        (input: CustomerInput) => {
          return input.stepNumber === step.stepNumber;
        },
      );

      if (
        !customerInputsOnThisStep ||
        customerInputsOnThisStep?.stepType != step.stepType
      ) {
        error = true;
        return;
      }

      if (step.stepType === "PRODUCT") {
        //Check if the number of products is in the range
        const maxProductsOnThisStep: number = step.productInput
          ?.maxProductsOnStep as number;
        const minProductsOnThisStep: number = step.productInput
          ?.minProductsOnStep as number;

        const actualProductsOnThisStep: ProductDto[] =
          customerInputsOnThisStep?.inputs as ProductDto[];

        if (
          actualProductsOnThisStep.length < minProductsOnThisStep ||
          actualProductsOnThisStep.length > maxProductsOnThisStep
        ) {
          error = true;
          return;
        }

        //Checking if the customer vas allowed to select the same product multiple times
        const allowMultipleSelections: boolean = step.productInput
          ?.allowProductDuplicates as boolean;

        if (!allowMultipleSelections) {
          actualProductsOnThisStep.forEach((product) => {
            if (product.quantity > 1) {
              error = true;
            }
          });
        }

        //Check in the future if the customer is allowed to select the products that are selected
        //
        // Implementation
        //
      } else if (step.stepType === "CONTENT") {
        const contentInputs: ContentDto[] =
          customerInputsOnThisStep?.inputs as ContentDto[];

        step.contentInputs?.forEach((contentInput) => {
          //Customer content input on this step
          const contentInputsOnThisStep: ContentDto = contentInputs.find(
            (input) => {
              return input.id == contentInput.id;
            },
          ) as ContentDto;

          //Check if the content is required and if the content is not empty
          if (
            contentInputsOnThisStep.value.length == 0 &&
            contentInput.required
          ) {
            error = true;
            return;
          }

          //Check if the content is not too long
          if (contentInputsOnThisStep.value.length > contentInput.maxChars) {
            error = true;
            return;
          }

          //Check if the content type is correct

          //prettier-ignore
          if (contentInputsOnThisStep.type === "file" && contentInput.inputType != "IMAGE") { error = true; return;}

          //prettier-ignore
          if (contentInputsOnThisStep.type === "text" && !(contentInput.inputType === "TEXT" || contentInput.inputType === "NUMBER")) { error = true; return ;}
        });
      }
    });

    if (error) {
      return json(new JsonData(false, "error", "Invalid form data.", []), {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        status: 200,
      });
    }

    if (files) {
      //Service for uplaoding files
      const fileStoreService: FileStoreService = new FileStoreServiceImpl();

      customerInputs.forEach((input) => {
        if (input.stepType === "CONTENT") {
          const contentInputs: ContentDto[] = input.inputs as ContentDto[];

          contentInputs.forEach(async (contentInput) => {
            if (contentInput.type === "file") {
              //File for upload
              let fileToUpload: File;

              //Check if the file is an array or a single file
              if (!Array.isArray(files)) {
                fileToUpload = files as File;
              } else {
                fileToUpload = files.find((file) => {
                  return file.name === contentInput.value;
                }) as File;
              }

              const fileId = await fileStoreService.uploadFile(fileToUpload);

              contentInput.value = fileId;
            }
          });
        }
      });
    }

    //Get the admin client
    const { admin } = await unauthenticated.admin(shop);

    //Getting bundle price before the discount
    let bundleCompareAtPrice =
      bundle.pricing === "FIXED" ? (bundle.priceAmount as number) : 0;

    //Replace all the REST_API product variant ids with with GRAPHQL_API product variant ids
    customerInputs.forEach((input) => {
      if (input.stepType === "PRODUCT") {
        const products: ProductDto[] = input.inputs as ProductDto[];

        products.forEach(async (product) => {
          product.id = `gid://shopify/ProductVariant/${product.id}`;
          if (bundle.pricing === "CALCULATED") {
            const response = await admin.graphql(
              `#graphql
                query getProductVariantPrice($productId: ID!) {
                  productVariant(id: $productId) {
                    amount
                  }
                }`,
              {
                variables: {
                  productId: product.id,
                },
              },
            );

            const data = await response.json();

            //Add the price of the product to the bundle price
            bundleCompareAtPrice += data.data.productVariant.price;
          }
        });
      }
    });

    //Calculate the bundle price affter the discount
    let bundlePrice;

    if (bundle.discountType === "FIXED") {
      bundlePrice = bundleCompareAtPrice - bundle.discountValue;
    } else if (bundle.discountType === "PERCENTAGE") {
      bundlePrice =
        bundleCompareAtPrice -
        bundleCompareAtPrice * (bundle.discountValue / 100);
    } else {
      bundlePrice = bundleCompareAtPrice;
    }

    //Create a new dummy product variant with the bundle data and return the variant id
    const response = await admin.graphql(
      `#graphql
     mutation createProductVariant($productId: ID!, $variants: [ProductVariantInput!]!) {
      productVariantsBulkCreate(productId: $productId, variants: $variants) {
        productVariants {
          id
        }
        userErrors {
          field
          message
        }
      }
     }
    `,
      {
        variables: {
          productId: bundle.shopifyProductId,
          variants: [
            {
              compareAtPrice: bundleCompareAtPrice,
              price: bundlePrice,
              optionValues: [
                {
                  optionName: "Title",
                  name: bu,
                },
              ],
            },
          ],
        },
      },
    );

    admin.graphql(
      `mutation CreateBundleComponents($input: [ProductVariantRelationshipUpdateInput!]!) {
        productVariantRelationshipBulkUpdate(input: $input) {
          parentProductVariants {
            id
            productVariantComponents(first: 10) {
              nodes{
                id
                quantity
                productVariant {
                  id
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
        input: [
          {
            parentProductVariantId:
              "gid://shopify/ProductVariant/PRODUCT-VARIANT-ID",
            productVariantRelationshipsToCreate: [
              {
                id: "gid://shopify/ProductVariant/SHAMPOO-PRODUCT-VARIANT-ID-COMPONENT-1",
                quantity: 1,
              },
              {
                id: "gid://shopify/ProductVariant/SOAP-PRODUCT-VARIANT-ID-COMPONENT-2",
                quantity: 1,
              },
            ],
          },
        ],
      },
    );

    // Implementation
  } catch (error) {
    console.log(error);

    if (error) {
      return json(new JsonData(false, "error", "Invalid form data.", []), {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        status: 200,
      });
    }
  }

  return json(
    new JsonData(true, "success", "Bundle succesfuly added to cart.", []),
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      status: 200,
    },
  );
};
