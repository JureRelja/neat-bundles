export type CreateBundleBuilderClient = {
    shopifyProductId: string;
    title: string;
    published: boolean;
    createdAt: Date;
    pricing: "FIXED" | "CALCULATED";
    priceAmount: number | null;
    discountType: "NO_DISCOUNT" | "FIXED" | "PERCENTAGE";
    discountValue: number | null;
    shop: string;
};
