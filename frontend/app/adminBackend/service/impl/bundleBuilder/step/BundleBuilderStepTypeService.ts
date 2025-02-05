import { BundleStep } from "@prisma/client";
import { BundleStepContent, BundleStepProduct } from "../../../dto/BundleStep";
import { bundleBuilderDeleteStepService } from "../../../impl/bundleBuilder/step/BundleBuilderDeleteStepService";
import { error } from "../../../dto/jsonData";
import { ContentStepDataDto } from "~/adminBackend/service/dto/ContentStepDataDto";
import { ProductStepDataDto } from "~/adminBackend/service/dto/ProductStepDataDto";

export abstract class BundleBuilderStepTypeService {
    abstract checkIfErrorsInStepData(stepData: BundleStep | BundleStepProduct | BundleStepContent): error[];

    abstract addNewStep(bundleId: number, stepData: ProductStepDataDto | ContentStepDataDto): Promise<BundleStep | BundleStepProduct | BundleStepContent>;

    abstract duplicateStep(bundleId: number, stepId: number): Promise<BundleStep | BundleStepProduct | BundleStepContent>;

    abstract updateStep(stepData: BundleStep | BundleStepProduct | BundleStepContent): Promise<BundleStep | BundleStepProduct | BundleStepContent>;
}
