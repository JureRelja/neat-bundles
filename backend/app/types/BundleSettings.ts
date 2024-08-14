import { Prisma } from "@prisma/client";

export const bundleSettingsSelect = {
  id: true,
  bundleId: true,
  pricing: true,
  discountType: true,
  discountValue: true,
  displayDiscountBanner: true,
  skipTheCart: true,
  allowBackNavigation: true,
  showOutOfStockProducts: true,
  numOfProductColumns: true,
  bundleColors: true,
  bundleLabels: true,
};

export type BundleSettingsWithAllResources = Prisma.BundleSettingsGetPayload<{
  select: typeof bundleSettingsSelect;
}>;
