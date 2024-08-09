import { Prisma } from "@prisma/client";

export const bundleSettingsInclude = {
  id: true,
  pricing: true,
  discountType: true,
  discountValue: true,
  displayDiscountBanner: true,
  skipTheCart: true,
  allowBackNavigation: true,
  showOutOfStockProducts: true,
  numOfProductColumns: true,
  bundleColorsId: true,
  bundleLabelsId: true,
  bundleColors: {
    select: {
      stepsIcon: true,
      addToBundleBtn: true,
      addToBundleText: true,
      nextStepBtn: true,
      nextStepBtnText: true,
      titleAndDESC: true,
      viewProductBtn: true,
      removeProductsBtn: true,
      prevStepBtn: true,
      prevStepBtnText: true,
    },
  },
  bundleLabels: {
    select: {
      addToBundleBtn: true,
      nextStepBtn: true,
      prevStepBtn: true,
      viewProductBtn: true,
    },
  },
};

export type BundleSettingsWithAllResources = Prisma.BundleSettingsGetPayload<{
  include: typeof bundleSettingsInclude;
}>;
