import type { BundleBuilder } from "@prisma/client";
import { BundlePricing, BundleDiscountType } from "@prisma/client";

export class BundleBuilderEntity implements BundleBuilder {
    id: number;

    shopifyProductId: string;

    title: string;

    published: boolean;

    createdAt: Date;

    pricing: BundlePricing = BundlePricing.CALCULATED;

    priceAmount: number | null;

    discountType: BundleDiscountType = BundleDiscountType.NO_DISCOUNT;

    discountValue: number | null;

    shop: string;
}
