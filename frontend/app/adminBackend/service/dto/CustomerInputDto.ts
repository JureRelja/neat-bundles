import { ContentDto } from "./ContentDto";
import { ProductDto } from "./ProductDto";

export interface CustomerInputDto {
  stepNumber: number;
  stepType: "PRODUCT" | "CONTENT";
  inputs: ProductDto[] | ContentDto[];
}
