import { AdminApiContext } from '@shopify/shopify-app-remix/server';
import { AddedProductVariantDto } from '~/dto/AddedProductVariantDto';
import { BundleFullAndStepsFullDto } from '~/dto/BundleFullAndStepsFullDto';
import { CustomerInputDto } from '~/dto/CustomerInputDto';
import { ProductDto } from '~/dto/ProductDto';
import { ShopifyProductVariantService } from './ShopifyProductVariantService';

export class CustomerInputService {
    constructor() {}

    //Go through the customer inputs and extract the data
    //Extract the productVariant ids and quantities
    //Extract the total price of the products

    public extractDataFromCustomerInputs(customerInputs: CustomerInputDto[], bundle: BundleFullAndStepsFullDto, productVariantService: ShopifyProductVariantService) {
        let addedProductVariants: AddedProductVariantDto[] = [];
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
            }
        });

        return { addedProductVariants, totalProductPrice };
    }
}
