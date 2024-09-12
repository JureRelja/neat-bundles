import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { AddedProductVariantDto } from "~/dto/AddedProductVariantDto";
import { BundleFullAndStepsFullDto } from "~/dto/BundleFullAndStepsFullDto";
import { CustomerInputDto } from "~/dto/CustomerInputDto";
import { ProductDto } from "~/dto/ProductDto";

export class CustomerInputService {
  constructor() {}

  //Go through the customer inputs and extract the data
  //Extract the productVariant ids and quantities
  //Extract the total price of the products

  public extractDataFromCustomerInputs(
    customerInputs: CustomerInputDto[],
    bundle: BundleFullAndStepsFullDto,
    admin: AdminApiContext,
  ) {
    let addedProductVariants: AddedProductVariantDto[] = [];
    let totalProductPrice = 0;

    customerInputs.forEach((input) => {
      if (input.stepType === "PRODUCT") {
        const products: ProductDto[] = input.inputs as ProductDto[];

        products.forEach(async (product) => {
          product.id = `gid://shopify/ProductVariant/${product.id}`;

          //Storing addedProduct variants
          addedProductVariants.push({
            productVariant: product.id,
            quantity: product.quantity,
          });

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
            totalProductPrice += data.data.productVariant.price;
          }
        });
      }
    });

    return { addedProductVariants, totalProductPrice };
  }
}
