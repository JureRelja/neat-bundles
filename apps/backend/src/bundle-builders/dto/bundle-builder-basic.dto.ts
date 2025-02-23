import { BundleBuilderWithStepsBasicClient } from "@repo/shared-types";

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
