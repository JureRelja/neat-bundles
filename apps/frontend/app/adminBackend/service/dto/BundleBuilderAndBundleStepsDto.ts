import { BundleDiscountType, BundlePricing, Prisma } from "@db/server";
import { BundleBuilderStepDto } from "./BundleBuilderStepDto";

export interface BundleBuilderAndBundleStepsDto {
    id: number;
    deleted: boolean;
    shopifyProductId: string;
    shopifyPageId: string;
    title: string;
    published: boolean;
    createdAt: string;
    steps: BundleBuilderStepDto[];
    pricing: BundlePricing;
    priceAmount: number;
    discountType: BundleDiscountType;
    discountValue: number;
    bundleBuilderPageHandle: string;
    storeUrl: string;
}
