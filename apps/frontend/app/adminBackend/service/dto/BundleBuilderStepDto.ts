import { StepType } from "@db/server";

export interface BundleBuilderStepDto {
    stepNumber: number;
    title: string;
    stepType: StepType;
    description: string;
}
