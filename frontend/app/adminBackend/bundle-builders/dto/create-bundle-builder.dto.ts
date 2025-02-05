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

    constructor(
        shopifyProductId: string,
        title: string,
        published: boolean,
        createdAt: Date,
        pricing: $Enums.BundlePricing,
        priceAmount: number | null,
        discountType: $Enums.BundleDiscountType,
        discountValue: number | null,
        shop: string,
    ) {
        this.shopifyProductId = shopifyProductId;
        this.title = title;
        this.pricing = pricing;
        this.priceAmount = priceAmount;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.shop = shop;
    }
}
