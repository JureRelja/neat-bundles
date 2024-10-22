import { BundleStep } from "@prisma/client";
import { BundleStepContent, BundleStepProduct } from "~/adminBackend/service/dto/BundleStep";
import db from "~/db.server";

export abstract class BundleBuilderStepTypeRepository {
    abstract getStepByBundleIdAndStepNumber(bundleId: number, stepNumber: number): Promise<BundleStep | BundleStepProduct | BundleStepContent | null>;

    abstract getStepById(stepId: number): Promise<BundleStep | BundleStepProduct | BundleStepContent | null>;

    abstract addNewStep(bundleId: number, stepDescription: string, stepNumber: number, newStepTitle: string): Promise<BundleStep | BundleStepProduct | BundleStepContent | null>;

    abstract updateStep(stepData: BundleStep | BundleStepProduct | BundleStepContent): Promise<BundleStep | BundleStepProduct | BundleStepContent | null>;
}
