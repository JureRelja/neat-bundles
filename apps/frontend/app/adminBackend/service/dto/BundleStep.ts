import type { Prisma } from "@db/server";

//Bundle step with only basic resources
export const bundleStepBasic = {
    id: true,
    stepNumber: true,
    description: true,
    title: true,
    stepType: true,
} satisfies Prisma.BundleBuilderStepSelect;

export type BundleStepBasicResources = Prisma.BundleBuilderStepGetPayload<{
    select: typeof bundleStepBasic;
}>;

/////

//Budnle step with all resources
export const bundleStepFull = {
    productInput: {
        include: {
            products: true,
        },
    },
    contentInput: true,
} satisfies Prisma.BundleBuilderStepSelect;

export type BundleStepAllResources = Prisma.BundleBuilderStepGetPayload<{
    include: typeof bundleStepFull;
}>;

//Bundle step of type product
export const selectBundleStepProduct = {
    ...bundleStepBasic,
    productInput: {
        include: {
            products: true,
        },
    },
} satisfies Prisma.BundleBuilderStepSelect;

export type BundleStepProduct = Prisma.BundleBuilderStepGetPayload<{
    select: typeof selectBundleStepProduct;
}>;

//Bundle step of type content
export const selectBundleStepContent = {
    ...bundleStepBasic,
    contentInput: true,
} satisfies Prisma.BundleBuilderStepSelect;

export type BundleStepContent = Prisma.BundleBuilderStepGetPayload<{
    select: typeof selectBundleStepContent;
}>;
