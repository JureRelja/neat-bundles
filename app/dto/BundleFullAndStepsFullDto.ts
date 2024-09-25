import { Prisma } from '@prisma/client';

//Defining basic bundle resources
export const bundleFullStepsFull = {
    steps: {
        include: {
            productInput: {
                include: {
                    products: true,
                },
            },
            contentInputs: true,
        },
    },
} satisfies Prisma.BundleBuilderSelect;

export type BundleFullAndStepsFullDto = Prisma.BundleBuilderGetPayload<{
    include: typeof bundleFullStepsFull;
}>;
