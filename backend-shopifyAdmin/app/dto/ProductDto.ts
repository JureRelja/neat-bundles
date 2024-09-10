export class ProductDto {
  private id: number;
  private quantity: number;

  constructor(id: number, quantity: number) {
    this.id = id;
    this.quantity = quantity;
  }

  public getId(): number {
    return this.id;
  }

  public getQuantity(): number {
    return this.quantity;
  }
}
