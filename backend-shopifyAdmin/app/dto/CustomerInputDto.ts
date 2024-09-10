import { ProductInputDto } from "./ProductInputDto";
import { ContentInputDto } from "./ContentInputsDto";

export class CustomerInputDto {
  private stepNumber: number;
  private input: ProductInputDto | ContentInputDto;
  private stepType: "PRODUCT" | "CONTENT";

  constructor(
    stepNumber: number,
    stepType: "PRODUCT" | "CONTENT",
    input: ProductInputDto | ContentInputDto,
  ) {
    this.stepNumber = stepNumber;
    this.input = input;
    this.stepType = stepType;
  }

  public getStepNumber(): number {
    return this.stepNumber;
  }

  public getInput(): ProductInputDto | ContentInputDto {
    return this.input;
  }

  public getStepType(): "PRODUCT" | "CONTENT" {
    return this.stepType;
  }
}
