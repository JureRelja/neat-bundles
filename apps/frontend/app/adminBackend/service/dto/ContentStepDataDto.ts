import { BundleBuilderStepDto } from "./BundleBuilderStepDto";
import { UserContentInputDto } from "./UserContentInputDto";

export interface ContentStepDataDto extends BundleBuilderStepDto {
    contentInputs: UserContentInputDto[];
}
