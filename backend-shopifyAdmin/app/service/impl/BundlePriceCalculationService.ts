import { BundleFullAndStepsFullDto } from "~/dto/BundleFullAndStepsFullDto";

export class BundlePriceCalculationService {
  constructor() {}

  //Calculate the price of the bundle
  public getFinalBundlePrices(
    bundle: BundleFullAndStepsFullDto,
    totalProductPrice: number,
  ) {
    //Getting bundle price before the discount
    let bundlePrice = 0;

    //Compare at price
    let bundleCompareAtPrice =
      bundle.pricing === "CALCULATED"
        ? totalProductPrice
        : (bundle.priceAmount as number);

    if (bundle.discountType === "FIXED") {
      //Subtract the discount value from the compare at price
      bundlePrice = bundleCompareAtPrice - bundle.discountValue;
    } else if (bundle.discountType === "PERCENTAGE") {
      //Subtract the discount value from the compare at price
      bundlePrice =
        bundleCompareAtPrice -
        bundleCompareAtPrice * (bundle.discountValue / 100);
    } else {
      bundlePrice = bundleCompareAtPrice;
    }

    return { bundlePrice, bundleCompareAtPrice };
  }
}
