import type { StepTypeClient } from "./StepTypeClient";

export type BundleStepProductClient = {
    id: number;
    stepNumber: number;
    title: string;
    description: string;
    stepType: StepTypeClient;
    productInput: {
        id: number;
        bundleStepId: number;
        products: {
            shopifyProductId: string;
            shopifyProductHandle: string;
        }[];

        minProductsOnStep: number;
        maxProductsOnStep: number;
        allowProductDuplicates: boolean;
        showProductPrice: boolean;
    } | null;
};
