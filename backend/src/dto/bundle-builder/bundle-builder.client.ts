export type BundleBuilderClient = {
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
};
