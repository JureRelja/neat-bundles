export enum BundleSettingsDiscountType {
  FIXED = "fixed",
  PERCENTAGE = "percentage",
  NO_DISCOUNT = "no_discount",
}

export enum BundlePricing {
  FIXED = "fixed",
  CALCULATED = "calculated",
}

export type BundleSettings = {
  bundlePricing: BundlePricing;
  discountType: BundleSettingsDiscountType;
  discountValue: number;
  displayDiscountBanner: boolean;
  skipTheCart: boolean;
  allowBackNavigation: boolean;
  showOutOfStockProducts: boolean;
  numOfProductColumns: number;
  colors: {
    stepsIcon: string;
    addToBundleBtn: string;
    addToBundleText: string;
    nextStepBtn: string;
    nextStepBtnText: string;
    titleAndDESC: string;
    viewProductsBtn: string;
    removeProductBtn: string;
    prevStepBtn: string;
    prevStepBtnText: string;
  };
  labels: {
    addToBundleBtn: string;
    nextStepBtn: string;
    viewProductsBtn: string;
    prevBtn: string;
  };
};

export const defaultBundleSettings: BundleSettings = {
  bundlePricing: BundlePricing.CALCULATED,
  discountType: BundleSettingsDiscountType.PERCENTAGE,
  discountValue: 10,
  displayDiscountBanner: false,
  skipTheCart: false,
  allowBackNavigation: false,
  showOutOfStockProducts: false,
  numOfProductColumns: 4,
  colors: {
    stepsIcon: "#000000",
    addToBundleBtn: "#000000",
    addToBundleText: "#000000",
    nextStepBtn: "#000000",
    nextStepBtnText: "#000000",
    titleAndDESC: "#000000",
    viewProductsBtn: "#000000",
    removeProductBtn: "#000000",
    prevStepBtn: "#000000",
    prevStepBtnText: "#000000",
  },
  labels: {
    addToBundleBtn: "Add to bundle",
    nextStepBtn: "Next step",
    viewProductsBtn: "View products",
    prevBtn: "Previous",
  },
};
