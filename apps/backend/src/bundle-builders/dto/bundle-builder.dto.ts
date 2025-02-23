import { BundleBuilderClient } from "../../../../../packages/shared-types/src/bundle-builder/bundle-builder.client";

export class BundleBuilderDto implements BundleBuilderClient {
    id: number;
    shopifyProductId: string;
    title: string;
    published: boolean;
    createdAt: Date;
    pricing: "FIXED" | "CALCULATED";
    priceAmount: number | null;
    discountType: "NO_DISCOUNT" | "FIXED" | "PERCENTAGE";
    discountValue: number | null;
    shop: string;
}
