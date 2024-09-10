import { ProductDto } from "./ProductDto";

export class ProductInputDto {
  private products: ProductDto[];

  constructor(products: ProductDto[]) {
    this.products = products;
  }

  public getProducts(): ProductDto[] {
    return this.products;
  }
}
