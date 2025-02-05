import { Prisma } from "@prisma/client";

//Defining basic bundle resources
export const bundleFullStepsFull = {
    BundleBuilderStep: {
        include: {
            ProductInput: true,
            ContentInput: true,
        },
    },
} satisfies Prisma.BundleBuilderSelect;

export type BundleFullAndStepsFullDto = Prisma.BundleBuilderGetPayload<{
    include: typeof bundleFullStepsFull;
}>;
