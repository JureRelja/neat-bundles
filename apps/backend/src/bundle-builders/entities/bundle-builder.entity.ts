import { $Enums, BundleBuilder } from "@db/server";

export class BundleBuilderEntity implements BundleBuilder {
    id: number;
    title: string;
    shopifyProductId: string;
    published: boolean;
    createdAt: Date;
    priceAmount: number | null;
    pricing: $Enums.BundlePricing;
    discountType: $Enums.BundleDiscountType;
    discountValue: number | null;
    shop: string;
}
