import type { $Enums } from "@prisma/client";
import { CreateBundleBuilderClient } from "../../dto/bundle-builder/create-bundle-builder.client";

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
