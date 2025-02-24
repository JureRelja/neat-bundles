import { Product } from "@db/server";

export interface UserProductInputDto {
    minProductsOnStep: number;
    maxProductsOnStep: number;
    allowProductDuplicates: boolean;
    showProductPrice: boolean;
    products: Product[];
}
