import { AddedProductVariantDto } from '~/dto/AddedProductVariantDto';
import db from '../db.server';
import { AddedContentDto } from '~/dto/AddedContentDto';

export class CreatedBundleRepository {
    constructor() {}

    public static async createCreatedBundle(
        bundleId: number,
        finalPrice: number,
        discountAmount: number,
        productVariants?: AddedProductVariantDto[],
        addedContent?: AddedContentDto[],
    ) {
        const createdBundle = await db.createdBundle.create({
            data: {
                bundleId: bundleId,
                createdAt: new Date(),
                finalPrice: finalPrice,
                discountAmount: discountAmount,
                addedProductVariants: {
                    create: productVariants?.map((variant) => {
                        return variant;
                    }),
                },
                addedContent: {
                    create: addedContent?.map((content) => {
                        return {
                            contentType: content.contentType,
                            contentValue: content.value,
                        };
                    }),
                },
            },
            select: {
                id: true,
            },
        });

        return createdBundle.id;
    }
}
