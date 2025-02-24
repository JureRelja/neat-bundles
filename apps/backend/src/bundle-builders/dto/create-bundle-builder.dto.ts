import { $Enums } from "@db/server";
import { CreateBundleBuilderClient } from "@repo/shared-types";

export class CreateBundleBuilderDto implements CreateBundleBuilderClient {
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
