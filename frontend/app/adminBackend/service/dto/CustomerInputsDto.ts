import type { AdminApiContext } from "@shopify/shopify-app-remix/server";
import type { AddedProductVariantDto } from "@adminBackend/service/dto/AddedProductVariantDto";
import type { BundleBuilderAndBundleStepsDto } from "@adminBackend/service/dto/BundleBuilderAndBundleStepsDto";
import type { CustomerInputDto } from "@adminBackend/service/dto/CustomerInputDto";
import type { ProductDto } from "@adminBackend/service/dto/ProductDto";
import type { ShopifyProductVariantRepository } from "../../repository/impl/ShopifyProductVariantRepository";
import { shopifyProductVariantRepository } from "../../repository/impl/ShopifyProductVariantRepository";
import { AddedContentDto } from "@adminBackend/service/dto/AddedContentDto";
import type { ContentDto } from "@adminBackend/service/dto/ContentDto";
import { AddedContentItemDto } from "@adminBackend/service/dto/AddedContentItemDto";

export class CustomerInputsDto {
    constructor() {}

    //Go through the customer inputs and extract the data
    //Extract the productVariant ids and quantities
    //Extract the content types and values (if any)
    //Extract the total price of the products

    public static async extractDataFromCustomerInputs(
        admin: AdminApiContext,
        customerInputs: CustomerInputDto[],
        bundle: BundleBuilderAndBundleStepsDto,
        productVariantService: ShopifyProductVariantRepository,
    ) {
        let addedProductVariants: AddedProductVariantDto[] = [];

        let addedContent: AddedContentDto[] = [];

        let totalProductPrice: number = 0;

        await Promise.all(
            customerInputs.map(async (input) => {
                if (input.stepType === "PRODUCT") {
                    const products: ProductDto[] = input.inputs as ProductDto[];

                    await Promise.all(
                        products.map(async (product) => {
                            product.id = `gid://shopify/ProductVariant/${product.id}`;

                            //Storing addedProduct variants
                            addedProductVariants.push({
                                productVariant: product.id,
                                quantity: product.quantity,
                            });

                            if (bundle.pricing === "CALCULATED") {
                                const price = await productVariantService.getProductVariantPrice(admin, product.id);

                                //Add the price of the product to the bundle price
                                totalProductPrice += price;
                            }
                        }),
                    );
                } else if (input.stepType === "CONTENT") {
                    const contentInputs: ContentDto[] = input.inputs as ContentDto[];

                    const addedContentOnThisStep = new AddedContentDto(input.stepNumber, []);

                    contentInputs.forEach((contentInput) => {
                        addedContentOnThisStep.addContentItem({
                            contentType: contentInput.type === "file" ? "IMAGE" : "TEXT",
                            value: contentInput.value,
                        });
                    });

                    addedContent.push(addedContentOnThisStep);
                }
            }),
        );

        return { addedProductVariants, addedContent, totalProductPrice };
    }
}
