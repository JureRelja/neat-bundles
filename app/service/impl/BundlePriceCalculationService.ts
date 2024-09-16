import { BundleFullAndStepsFullDto } from '~/dto/BundleFullAndStepsFullDto';

export class BundlePriceCalculationService {
    constructor() {}

    //Calculate the price of the bundle
    public static getFinalBundlePrices(bundle: BundleFullAndStepsFullDto, totalProductPrice: number) {
        //Getting bundle price before the discount
        let bundlePrice = 0;

        //Compare at price
        let bundleCompareAtPrice = bundle.pricing === 'CALCULATED' ? totalProductPrice : (bundle.priceAmount as number);

        if (bundle.discountType === 'FIXED') {
            //Subtract the discount value from the compare at price
            bundlePrice = bundleCompareAtPrice - bundle.discountValue;
        } else if (bundle.discountType === 'PERCENTAGE') {
            //Subtract the discount value from the compare at price
            bundlePrice = bundleCompareAtPrice - bundleCompareAtPrice * (bundle.discountValue / 100);
        } else {
            bundlePrice = bundleCompareAtPrice;
        }

        //Check if the price is negative and set it to 0
        //This can happend if the discount is too big
        if (bundlePrice < 0) {
            bundlePrice = 0;
        }

        //Total discount amount
        const discountAmount = bundleCompareAtPrice - bundlePrice;

        return { bundlePrice, bundleCompareAtPrice, discountAmount };
    }
}
