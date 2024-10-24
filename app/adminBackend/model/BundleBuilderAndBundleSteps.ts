import { Prisma } from "@prisma/client";

export const bundleBuilderAndBundleSteps = {
    steps: true,
} satisfies Prisma.BundleBuilderSelect;

export type BundleBuilderAndBundleSteps = Prisma.BundleBuilderGetPayload<{
    include: typeof bundleBuilderAndBundleSteps;
}>;
