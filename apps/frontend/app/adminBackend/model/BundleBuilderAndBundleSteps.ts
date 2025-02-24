import type { Prisma } from "@db/server";

export const bundleBuilderAndBundleSteps = {
    bundleBuilderSteps: true,
} satisfies Prisma.BundleBuilderSelect;

export type BundleBuilderAndBundleSteps = Prisma.BundleBuilderGetPayload<{
    include: typeof bundleBuilderAndBundleSteps;
}>;
