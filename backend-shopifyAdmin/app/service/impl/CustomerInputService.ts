import { AdminApiContext } from '@shopify/shopify-app-remix/server';
import { AddedProductVariantDto } from '~/dto/AddedProductVariantDto';
import { BundleFullAndStepsFullDto } from '~/dto/BundleFullAndStepsFullDto';
import { CustomerInputDto } from '~/dto/CustomerInputDto';
import { ProductDto } from '~/dto/ProductDto';
import { ShopifyProductVariantService } from './ShopifyProductVariantService';
import { AddedContentDto } from '~/dto/AddedContentDto';
import { ContentDto } from '~/dto/ContentDto';
import { AddedContentItemDto } from '~/dto/AddedContentItemDto';

export class CustomerInputService {
    constructor() {}

    //Go through the customer inputs and extract the data
    //Extract the productVariant ids and quantities
    //Extract the content types and values (if any)
    //Extract the total price of the products

    public static extractDataFromCustomerInputs(customerInputs: CustomerInputDto[], bundle: BundleFullAndStepsFullDto, productVariantService: ShopifyProductVariantService) {
        let addedProductVariants: AddedProductVariantDto[] = [];

        let addedContent: AddedContentDto[] = [];

        let totalProductPrice = 0;

        customerInputs.forEach((input) => {
            if (input.stepType === 'PRODUCT') {
                const products: ProductDto[] = input.inputs as ProductDto[];

                products.forEach(async (product) => {
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
                });
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
        });

        return { addedProductVariants, addedContent, totalProductPrice };
    }
}
