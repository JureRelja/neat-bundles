import { Prisma } from "@prisma/client";

const bundleStepInclude = {
  bundleId: true,
  id: true,
  stepNumber: true,
  title: true,
  stepType: true,
  description: true,
  productResources: true,
  resourceType: true,
  minProductsOnStep: true,
  maxProductsOnStep: true,
  allowProductDuplicates: true,
  showProductPrice: true,
  contentInputs: true,
};

export type BundleStepWithAllResources = Prisma.BundleStepGetPayload<{
  include: typeof bundleStepInclude;
}>;
