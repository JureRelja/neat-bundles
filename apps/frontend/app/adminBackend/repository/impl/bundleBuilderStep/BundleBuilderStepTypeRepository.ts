import db, { BundleBuilderStep } from "@db/server";
import { BundleStepContent, BundleStepProduct } from "~/adminBackend/service/dto/BundleStep";
import { ContentStepDataDto } from "~/adminBackend/service/dto/ContentStepDataDto";
import { ProductStepDataDto } from "~/adminBackend/service/dto/ProductStepDataDto";

export abstract class BundleBuilderStepTypeRepository {
    abstract getStepByBundleIdAndStepNumber(bundleId: number, stepNumber: number): Promise<BundleBuilderStep | BundleStepProduct | BundleStepContent | null>;

    abstract getStepById(stepId: number): Promise<BundleBuilderStep | BundleStepProduct | BundleStepContent | null>;

    abstract addNewStep(
        bundleId: number,
        stepData: BundleBuilderStep | ProductStepDataDto | ContentStepDataDto,
    ): Promise<BundleBuilderStep | BundleStepProduct | BundleStepContent | null>;

    abstract updateStep(stepData: BundleBuilderStep | BundleStepProduct | BundleStepContent): Promise<BundleBuilderStep | BundleStepProduct | BundleStepContent | null>;
}
