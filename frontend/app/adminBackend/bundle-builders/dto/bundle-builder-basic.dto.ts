import { Prisma } from "@prisma/client";

//Defining basic bundle resources
export const bundleBuilderAndStepsBasicSelect: Prisma.BundleBuilderSelect = {
    id: true,
    shopifyProductId: true,
    discountType: true,
    discountValue: true,
    shop: true,
    title: true,
    published: true,
    createdAt: true,
    pricing: true,
    priceAmount: true,
    BundleBuilderStep: {
        select: {
            id: true,
            title: true,
            stepNumber: true,
            stepType: true,
        },
    },
} satisfies Prisma.BundleBuilderSelect;

// On the server, date is a Date object
export type BundleBuilderAndStepsBasicDto = Prisma.BundleBuilderGetPayload<{
    select: typeof bundleBuilderAndStepsBasicSelect;
}>;
