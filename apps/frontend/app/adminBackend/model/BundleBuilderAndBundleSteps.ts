import type { Prisma } from "@prisma/client";

export const bundleBuilderAndBundleSteps = {
    bundleBuilderSteps: true,
} satisfies Prisma.BundleBuilderSelect;

export type BundleBuilderAndBundleSteps = Prisma.BundleBuilderGetPayload<{
    include: typeof bundleBuilderAndBundleSteps;
}>;
