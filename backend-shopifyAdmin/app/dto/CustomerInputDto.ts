import { ContentDto } from "./ContentDto";
import { ProductDto } from "./ProductDto";

export interface CustomerInput {
  stepNumber: number;
  stepType: "PRODUCT" | "CONTENT";
  inputs: ProductDto[] | ContentDto[];
}
