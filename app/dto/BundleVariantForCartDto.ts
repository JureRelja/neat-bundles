import { get } from 'http';
import { AddedContentDto } from './AddedContentDto';

export class BundleVariantForCartDto {
    private bundleId: number;
    private bundleInputsCustomer: { [key: string]: string } = {}; //This is used to display what the customer has inputed in the cart and checkout page
    private bundleTitle: string;
    private bundleInputsAdmin: string; // This is used to display what the customer has inputed in the admin orders page

    constructor(bundleVariantId: string, bundleTitle: string, addedBundleContent: AddedContentDto[]) {
        this.bundleTitle = bundleTitle;

        //Turn bundle variant ID into Shopify REST API ID
        const bundleVariantIdArray = bundleVariantId.split('/');
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
            return { customerBundleInputs: {}, adminBundleInputs: '' };
        }

        const lineItemProperties: { [key: string]: string } = {}; //This is used to display what the customer has inputed in the cart and checkout page

        let cartAttributes: string = ''; // This is used to display what the customer has inputed in the admin orders page

        lineItemProperties[`_neat_bundle_id`] = `${bundleId}`;
        lineItemProperties[`- :-----Bundle Content-----`] = '-';

        addedContent.forEach((addedContentOnStep) => {
            const stepNumber = addedContentOnStep.getStepNumber();

            cartAttributes += 'Step #' + stepNumber + ': \n';

            addedContentOnStep.getContentItems().forEach((contentItem) => {
                //If the content type is an image, we need to display the image url
                if (contentItem.contentType === 'IMAGE') {
                    lineItemProperties[`Step #${stepNumber} - IMAGE URL`] = contentItem.value;
                    cartAttributes += 'IMAGE URL: ' + contentItem.value;

                    return;
                }

                lineItemProperties[`Step #${stepNumber} - ${contentItem.contentType}`] = contentItem.value;
                cartAttributes += contentItem.contentType + ': ' + contentItem.value;

                if (addedContentOnStep.getContentItems().indexOf(contentItem) < addedContentOnStep.getContentItems().length - 1) {
                    cartAttributes += ', \n';
                }
            });

            if (addedContent.indexOf(addedContentOnStep) < addedContent.length - 1) {
                lineItemProperties[`- :----------------${this.getStringWithNumberOfDashes(stepNumber)}}`] = '-';

                cartAttributes += '  || \n\n';
            }
        });

        return { customerBundleInputs: lineItemProperties, adminBundleInputs: cartAttributes };
    }

    public static getStringWithNumberOfDashes(numberOfDashes: number): string {
        let dashes = '';

        for (let i = 0; i < numberOfDashes; i++) {
            dashes += '-';
        }

        return dashes;
    }
}
