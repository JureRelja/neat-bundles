import { BundleBuilderWithStepsBasicClient } from "../../../../../packages/shared-types/bundle-builder/bundle-builder-with-steps-basic.client";

export class BundleBuilderAndStepsBasicDto implements BundleBuilderWithStepsBasicClient {
    id: number;
    shopifyProductId: string;
    discountType: "NO_DISCOUNT" | "FIXED" | "PERCENTAGE";
    discountValue: number | null;
    shop: string;
    title: string;
    published: boolean;
    createdAt: Date;
    pricing: "FIXED" | "CALCULATED";
    priceAmount: number | null;
    bundleBuilderSteps: {
        id: number;
        title: string;
        stepNumber: number;
        stepType: "PRODUCT" | "CONTENT";
    }[];
}
