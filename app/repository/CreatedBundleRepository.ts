import { AddedProductVariantDto } from '~/dto/AddedProductVariantDto';
import db from '../db.server';
import { AddedContentDto } from '~/dto/AddedContentDto';

export class CreatedBundleRepository {
    constructor() {}

    public static async createCreatedBundle(
        bundleBuilderId: number,
        finalPrice: number,
        discountAmount: number,
        productVariants?: AddedProductVariantDto[],
        addedContent?: AddedContentDto[], // Added content items for all steps
    ) {
        const createdBundle = await db.createdBundle.create({
            data: {
                bundleBuilderId: bundleBuilderId,
                createdAt: new Date(),
                finalPrice: finalPrice,
                discountAmount: discountAmount,

                //Extract product variants from all steps
                addedProductVariants: {
                    create: productVariants?.map((variant) => {
                        return variant;
                    }),
                },

                //Extract content items from all steps
                addedContent: {
                    create: addedContent
                        ?.map((content) => {
                            return content.getContentItems().map((item) => {
                                return {
                                    contentType: item.contentType,
                                    contentValue: item.value,
                                };
                            });
                        })
                        .flat(),
                },
            },
            select: {
                id: true,
            },
        });

        return createdBundle.id;
    }
}
