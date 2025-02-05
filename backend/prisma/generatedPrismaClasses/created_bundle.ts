import { AddedContent } from "./added_content";
import { AddedProductVariant } from "./added_product_variant";
import { User } from "./user";

export class CreatedBundle {
    id: number;

    bundleBuilderId?: number;

    finalPrice: number;

    discountAmount: number;

    createdAt: Date;

    isSold: boolean;

    AddedContent: AddedContent[];

    AddedProductVariant: AddedProductVariant[];

    shop: string;

    user: User;
}
