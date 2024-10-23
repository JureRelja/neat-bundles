import { Product, ProductInput } from "@prisma/client";
import db from "~/db.server";

export class BundleBuilderProductInputRepository {
    public async updateSelectedProducts(bundleStepId: number, selectedProducts: Product[]): Promise<ProductInput> {
        const updatedProductInput: ProductInput = await db.productInput.update({
            where: {
                bundleStepId: bundleStepId,
            },
            data: {
                products: {
                    set: [],
                    connectOrCreate: selectedProducts.map((product: Product) => {
                        return {
                            where: {
                                shopifyProductId: product.shopifyProductId,
                            },
                            create: {
                                shopifyProductId: product.shopifyProductId,
                                shopifyProductHandle: product.shopifyProductHandle,
                            },
                        };
                    }),
                },
            },
        });
        return updatedProductInput;
    }

    // public async updateProductInput(bundleStepId: number, selectedProducts: Product[]): Promise<ProductInput> {
    //     const updatedProductInput: ProductInput = await db.productInput.update({
    //         where: {
    //             bundleStepId: bundleStepId,
    //         },
    //         data: {
    // minProductsOnStep: stepData.productInput?.minProductsOnStep,
    // maxProductsOnStep: stepData.productInput?.maxProductsOnStep,
    // allowProductDuplicates: stepData.productInput?.allowProductDuplicates,
    // showProductPrice: stepData.productInput?.showProductPrice,
    //             products: {
    //                 set: [],
    //                 connectOrCreate: selectedProducts.map((product: Product) => {
    //                     return {
    //                         where: {
    //                             shopifyProductId: product.shopifyProductId,
    //                         },
    //                         create: {
    //                             shopifyProductId: product.shopifyProductId,
    //                             shopifyProductHandle: product.shopifyProductHandle,
    //                         },
    //                     };
    //                 }),
    //             },
    //         },
    //     });
    //     return updatedProductInput;
    // }
}

export const bundleBuilderProductInputRepository = new BundleBuilderProductInputRepository();
