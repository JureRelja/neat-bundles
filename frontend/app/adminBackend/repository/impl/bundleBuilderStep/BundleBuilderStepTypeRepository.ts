import { BundleStep } from "@prisma/client";
import { BundleStepContent, BundleStepProduct } from "~/adminBackend/service/dto/BundleStep";
import { ContentStepDataDto } from "~/adminBackend/service/dto/ContentStepDataDto";
import { ProductStepDataDto } from "~/adminBackend/service/dto/ProductStepDataDto";
import db from "~/db.server";

export abstract class BundleBuilderStepTypeRepository {
    abstract getStepByBundleIdAndStepNumber(bundleId: number, stepNumber: number): Promise<BundleStep | BundleStepProduct | BundleStepContent | null>;

    abstract getStepById(stepId: number): Promise<BundleStep | BundleStepProduct | BundleStepContent | null>;

    abstract addNewStep(bundleId: number, stepData: BundleStep | ProductStepDataDto | ContentStepDataDto): Promise<BundleStep | BundleStepProduct | BundleStepContent | null>;

    abstract updateStep(stepData: BundleStep | BundleStepProduct | BundleStepContent): Promise<BundleStep | BundleStepProduct | BundleStepContent | null>;
}
