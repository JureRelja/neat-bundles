import { Product } from "@prisma/client";

export interface UserProductInputDto {
    minProductsOnStep: number;
    maxProductsOnStep: number;
    allowProductDuplicates: boolean;
    showProductPrice: boolean;
    products: Product[];
}
