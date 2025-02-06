import { BundleBuilderStep } from "./bundle_builder_step";
import { Product } from "./product";

export class ProductInput {
    id: number;

    bundleStepId: number;

    minProductsOnStep: number;

    maxProductsOnStep: number;

    allowProductDuplicates: boolean;

    showProductPrice: boolean;

    BundleStep: BundleBuilderStep;

    Product: Product[];
}
