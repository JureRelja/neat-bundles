import { CreatedBundle } from "./created_bundle";

export class AddedProductVariant {
    id: number;

    productVariant: string;

    quantity: number;

    createdBundleId: number;

    CreatedBundle: CreatedBundle;
}
