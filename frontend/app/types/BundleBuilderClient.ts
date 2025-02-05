export interface BundleBuilderClient {
    id: number;
    deleted: boolean;
    shopifyProductId: string;
    shopifyPageId: string;
    title: string;
    published: boolean;
    createdAt: string;
    pricing: "CALCULATED" | "FIXED";
    priceAmount: number | null;
    discountType: "PERCENTAGE" | "FIXED" | "NO_DISCOUNT";
    discountValue: number;
    bundleBuilderPageHandle: string;
    storeUrl: string;
}
