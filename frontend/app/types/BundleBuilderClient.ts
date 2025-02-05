export class BundleBuilderClient {
    id: number;
    shopifyProductId: string;
    title: string;
    published: boolean;
    createdAt: string;
    pricing: "CALCULATED" | "FIXED";
    priceAmount: number | null;
    discountType: "PERCENTAGE" | "FIXED" | "NO_DISCOUNT";
    discountValue: number | null;
    shop: string;
}
