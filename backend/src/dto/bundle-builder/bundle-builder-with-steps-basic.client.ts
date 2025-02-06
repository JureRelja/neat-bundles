export type BundleBuilderWithStepsBasicClient = {
    id: number;

    shopifyProductId: string;

    title: string;

    published: boolean;

    createdAt: Date;

    pricing: "FIXED" | "CALCULATED";

    bundleBuilderPageUrl: string;

    priceAmount: number | null;

    discountType: "NO_DISCOUNT" | "FIXED" | "PERCENTAGE";

    discountValue: number | null;

    shop: string;

    bundleBuilderSteps: {
        id: number;
        title: string;
        stepNumber: number;
        stepType: "PRODUCT" | "CONTENT";
        description: string;
        bundleBuilderId: number;
    }[];
};
