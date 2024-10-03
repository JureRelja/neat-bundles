import { AdminApiContext } from '@shopify/shopify-app-remix/server';
import { AddedProductVariantDto } from '@adminBackend/service/dto/AddedProductVariantDto';
import { BundleFullAndStepsFullDto } from '@adminBackend/service/dto/BundleFullAndStepsFullDto';
import { CustomerInputDto } from '@adminBackend/service/dto/CustomerInputDto';
import { ProductDto } from '@adminBackend/service/dto/ProductDto';
import { ShopifyProductVariantService } from '../../repository/impl/ShopifyCreatedBundleProductVariantRepository';
import { AddedContentDto } from '@adminBackend/service/dto/AddedContentDto';
import { ContentDto } from '@adminBackend/service/dto/ContentDto';
import { AddedContentItemDto } from '@adminBackend/service/dto/AddedContentItemDto';

export class CustomerInputsDto {
    constructor() {}

    //Go through the customer inputs and extract the data
    //Extract the productVariant ids and quantities
    //Extract the content types and values (if any)
    //Extract the total price of the products

    public static async extractDataFromCustomerInputs(customerInputs: CustomerInputDto[], bundle: BundleFullAndStepsFullDto, productVariantService: ShopifyProductVariantService) {
        let addedProductVariants: AddedProductVariantDto[] = [];

        let addedContent: AddedContentDto[] = [];

        let totalProductPrice: number = 0;

        await Promise.all(
            customerInputs.map(async (input) => {
                if (input.stepType === 'PRODUCT') {
                    const products: ProductDto[] = input.inputs as ProductDto[];

                    await Promise.all(
                        products.map(async (product) => {
                            product.id = `gid://shopify/ProductVariant/${product.id}`;

                            //Storing addedProduct variants
                            addedProductVariants.push({
                                productVariant: product.id,
                                quantity: product.quantity,
                            });

                            if (bundle.pricing === 'CALCULATED') {
                                const price = await productVariantService.getProductVariantPrice(product.id);

                                //Add the price of the product to the bundle price
                                totalProductPrice += price;
                            }
                        }),
                    );
                } else if (input.stepType === 'CONTENT') {
                    const contentInputs: ContentDto[] = input.inputs as ContentDto[];

                    const addedContentOnThisStep = new AddedContentDto(input.stepNumber, []);

                    contentInputs.forEach((contentInput) => {
                        addedContentOnThisStep.addContentItem({
                            contentType: contentInput.type === 'file' ? 'IMAGE' : 'TEXT',
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
