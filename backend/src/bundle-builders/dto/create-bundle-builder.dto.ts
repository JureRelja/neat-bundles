import type { $Enums } from "@prisma/client";

export class CreateBundleBuilderDto {
    shopifyProductId: string;
    title: string;
    published: boolean;
    createdAt: Date;
    pricing: $Enums.BundlePricing;
    priceAmount: number | null;
    discountType: $Enums.BundleDiscountType;
    discountValue: number | null;
    shop: string;
}
