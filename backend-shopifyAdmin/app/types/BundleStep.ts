import { Prisma } from "@prisma/client";

//Bundle step with only basic resources
export const bundleStepBasic = {
  id: true,
  stepNumber: true,
  title: true,
  stepType: true,
} satisfies Prisma.BundleStepSelect;

export type BundleStepBasicResources = Prisma.BundleStepGetPayload<{
  select: typeof bundleStepBasic;
}>;

/////

//Budnle step with all resources
export const bundleStepFull = {
  productInput: true,
  contentInputs: true,
} satisfies Prisma.BundleStepSelect;

export type BundleStepAllResources = Prisma.BundleStepGetPayload<{
  include: typeof bundleStepFull;
}>;

//Bundle step of type product
export const selectBundleStepProduct = {
  ...bundleStepBasic,
  productInput: true,
} satisfies Prisma.BundleStepSelect;

export type BundleStepProduct = Prisma.BundleStepGetPayload<{
  select: typeof selectBundleStepProduct;
}>;

//Bundle step of type content
export const selectBundleStepContent = {
  ...bundleStepBasic,
  contentInputs: true,
} satisfies Prisma.BundleStepSelect;

export type BundleStepContent = Prisma.BundleStepGetPayload<{
  select: typeof selectBundleStepContent;
}>;
