import { UserProductInputDto } from "./UserProductInputDto";
import { BundleBuilderStepDto } from "./BundleBuilderStepDto";

export interface ProductStepDataDto extends BundleBuilderStepDto {
    productInput: UserProductInputDto;
}
