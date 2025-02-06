import { User } from "./user";
import { BundleBuilderConfig } from "./bundle_builder_config";
import { BundleBuilderStep } from "./bundle_builder_step";
import { BundlePricing, BundleDiscountType } from "@prisma/client";

export class BundleBuilder {
    id: number;

    shopifyProductId: string;

    title: string;

    published: boolean;

    createdAt: Date;

    pricing: BundlePricing = BundlePricing.CALCULATED;

    priceAmount?: number;

    discountType: BundleDiscountType = BundleDiscountType.NO_DISCOUNT;

    discountValue?: number;

    shop: string;

    user: User;

    bundleBuilderConfig?: BundleBuilderConfig;

    bundleBuilderSteps: BundleBuilderStep[];
}
