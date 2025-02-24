import { BundleBuilderStep } from "@db/server";
import { BundleStepContent, BundleStepProduct } from "../../../dto/BundleStep";
import { bundleBuilderDeleteStepService } from "../../../impl/bundleBuilder/step/BundleBuilderDeleteStepService";
import { error } from "../../../dto/jsonData";
import { ContentStepDataDto } from "~/adminBackend/service/dto/ContentStepDataDto";
import { ProductStepDataDto } from "~/adminBackend/service/dto/ProductStepDataDto";

export abstract class BundleBuilderStepTypeService {
    abstract checkIfErrorsInStepData(stepData: BundleBuilderStep | BundleStepProduct | BundleStepContent): error[];

    abstract addNewStep(bundleId: number, stepData: ProductStepDataDto | ContentStepDataDto): Promise<BundleBuilderStep | BundleStepProduct | BundleStepContent>;

    abstract duplicateStep(bundleId: number, stepId: number): Promise<BundleBuilderStep | BundleStepProduct | BundleStepContent>;

    abstract updateStep(stepData: BundleBuilderStep | BundleStepProduct | BundleStepContent): Promise<BundleBuilderStep | BundleStepProduct | BundleStepContent>;
}
