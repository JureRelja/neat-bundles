import { AddedContentDto } from './AddedContentDto';

export class BundleVariantForCartDto {
    private bundleId: number;
    private lineItemProperties: { [key: string]: string } = {};

    constructor(bundleVariantId: string, addedBundleContent: AddedContentDto[]) {
        //Turn bundle variant ID into Shopify REST API ID
        const bundleVariantIdArray = bundleVariantId.split('/');
        const bundleVariantIdShopify = bundleVariantIdArray[bundleVariantIdArray.length - 1];

        this.bundleId = parseInt(bundleVariantIdShopify);

        this.lineItemProperties = BundleVariantForCartDto.transformToLineKeyValuePair(addedBundleContent, this.bundleId);
    }

    public getBundleId(): number {
        return this.bundleId;
    }

    public setBundleId(bundleId: number): void {
        this.bundleId = bundleId;
    }

    public getAddedBundleContent() {
        return this.lineItemProperties;
    }

    //This method is used to transform the added content into a key-value pair to display what has customer inputed in the cart and admin orders page
    public static transformToLineKeyValuePair(addedContent: AddedContentDto[], bundleId: number): { [key: string]: string } {
        const lineItemProperties: { [key: string]: string } = {};

        lineItemProperties[`_Bundle ID`] = `${bundleId}`;

        lineItemProperties[`- :-----Bundle Content-----`] = '-';

        addedContent.forEach((addedContentOnStep) => {
            const stepNumber = addedContentOnStep.getStepNumber();

            addedContentOnStep.getContentItems().forEach((contentItem) => {
                lineItemProperties[`Step ${stepNumber} - ${contentItem.contentType}`] = contentItem.value;
            });

            if (addedContent.indexOf(addedContentOnStep) < addedContent.length - 1) {
                lineItemProperties[`- :----------------${this.getStringWithNumberOfDashes(stepNumber)}}`] = '-';
            }
        });

        return lineItemProperties;
    }

    public static getStringWithNumberOfDashes(numberOfDashes: number): string {
        let dashes = '';

        for (let i = 0; i < numberOfDashes; i++) {
            dashes += '-';
        }

        return dashes;
    }
}
