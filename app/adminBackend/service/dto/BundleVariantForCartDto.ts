import { get } from "http";
import { AddedContentDto } from "./AddedContentDto";
import { BundleFullAndStepsFullDto } from "./BundleFullAndStepsFullDto";

export class BundleVariantForCartDto {
    private bundleId: number;
    private bundleInputsCustomer: { [key: string]: string } = {}; //This is used to display what the customer has inputed in the cart and checkout page
    private bundleTitle: string;
    private bundleInputsAdmin: string; // This is used to display what the customer has inputed in the admin orders page

    constructor(bundleVariantId: string, bundleTitle: string, addedBundleContent: AddedContentDto[]) {
        this.bundleTitle = bundleTitle;

        //Turn bundle variant ID into Shopify REST API ID
        const bundleVariantIdArray = bundleVariantId.split("/");
        const bundleVariantIdShopify = bundleVariantIdArray[bundleVariantIdArray.length - 1];

        this.bundleId = parseInt(bundleVariantIdShopify);

        const { customerBundleInputs, adminBundleInputs } = BundleVariantForCartDto.getBundleInputsForCustomerAndAdmin(addedBundleContent, this.bundleId);

        this.bundleInputsCustomer = customerBundleInputs;

        this.bundleInputsAdmin = adminBundleInputs;
    }

    //This method is used to transform the added content into a key-value pair to display what has customer inputed in the cart and admin orders page
    public static getBundleInputsForCustomerAndAdmin(
        addedContent: AddedContentDto[],
        bundleId: number,
    ): { customerBundleInputs: { [key: string]: string }; adminBundleInputs: string } {
        if (addedContent.length === 0) {
            return { customerBundleInputs: {}, adminBundleInputs: "" };
        }

        const lineItemProperties: { [key: string]: string } = {}; //This is used to display what the customer has inputed in the cart and checkout page

        let cartAttributes: string = ""; // This is used to display what the customer has inputed in the admin orders page

        lineItemProperties[`_neat_bundles_id`] = `${bundleId}`;
        lineItemProperties[`- :-----Bundle Inputs-----`] = "-";

        addedContent.forEach((addedContentOnStep) => {
            const stepNumber = addedContentOnStep.getStepNumber();

            cartAttributes += "Step #" + stepNumber + ": \n";

            addedContentOnStep.getContentItems().forEach((contentItem, contentItemIndex) => {
                console.log("contentItem", contentItem);
                //If the content type is an image, we need to display the image url
                if (contentItem.contentType === "IMAGE") {
                    lineItemProperties[`Step #${stepNumber} - IMAGE URL`] = contentItem.value;
                    cartAttributes += "IMAGE URL: " + contentItem.value;
                }

                //If the content type is text or number, we just display the value
                if (contentItem.contentType === "TEXT" || contentItem.contentType === "NUMBER") {
                    if (addedContentOnStep.getContentItems().length > 1) {
                        lineItemProperties[`Step #${stepNumber} - input ${contentItemIndex + 1} - ${contentItem.contentType}`] = contentItem.value;
                    }
                    cartAttributes += contentItem.contentType + ": " + contentItem.value;
                }

                //Adding a command and a new line to separate the content items in Shopify admin orders page
                if (contentItemIndex < addedContentOnStep.getContentItems().length - 1) {
                    cartAttributes += ", \n";
                }
            });

            //This is used to separate the steps
            if (addedContent.indexOf(addedContentOnStep) < addedContent.length - 1) {
                lineItemProperties[`- :----------------${this.getStringWithNumberOfDashes(stepNumber)}`] = "-";

                cartAttributes += "   \n\n";
            }
        });

        return { customerBundleInputs: lineItemProperties, adminBundleInputs: cartAttributes };
    }

    public static getStringWithNumberOfDashes(numberOfDashes: number): string {
        let dashes = "";

        for (let i = 0; i < numberOfDashes; i++) {
            dashes += "-";
        }

        return dashes;
    }

    //Calculate the price of the bundle
    public static getFinalBundlePrices(bundle: BundleFullAndStepsFullDto, totalProductPrice: number) {
        //Getting bundle price before the discount
        let bundlePrice = 0;

        //Compare at price
        let bundleCompareAtPrice = bundle.pricing === "CALCULATED" ? totalProductPrice : (bundle.priceAmount as number);

        if (bundle.discountType === "FIXED") {
            //Subtract the discount value from the compare at price
            bundlePrice = bundleCompareAtPrice - bundle.discountValue;
        } else if (bundle.discountType === "PERCENTAGE") {
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
