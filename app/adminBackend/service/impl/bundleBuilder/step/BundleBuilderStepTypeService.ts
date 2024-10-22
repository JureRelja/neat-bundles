import { BundleStep } from "@prisma/client";
import { BundleStepContent, BundleStepProduct } from "../../../dto/BundleStep";
import { bundleBuilderDeleteStepService } from "../../../impl/bundleBuilder/step/BundleBuilderDeleteStepService";
import { error } from "../../../dto/jsonData";

export abstract class BundleBuilderStepTypeService {
    abstract checkIfErrorsInStepData(stepData: BundleStep | BundleStepProduct | BundleStepContent): error[];

    abstract addNewStep(bundleId: number, stepDescription: string, stepNumber: number, newStepTitle: string): Promise<BundleStep | BundleStepProduct | BundleStepContent>;

    abstract duplicateStep(bundleId: number, stepId: number): Promise<BundleStep | BundleStepProduct | BundleStepContent>;

    abstract updateStep(stepData: BundleStep | BundleStepProduct | BundleStepContent): Promise<BundleStep | BundleStepProduct | BundleStepContent>;
}
