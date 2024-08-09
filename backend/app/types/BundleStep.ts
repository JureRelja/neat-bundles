import { Prisma } from "@prisma/client";

export const bundleStepInclude = {
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

export const bundleStepBasic = {
  id: true,
  stepNumber: true,
  title: true,
  stepType: true,
};

export type BundleStepBasicResources = Prisma.BundleStepGetPayload<{
  select: typeof bundleStepBasic;
}>;
