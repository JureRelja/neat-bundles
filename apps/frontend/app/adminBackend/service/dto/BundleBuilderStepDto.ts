import { StepType } from "@prisma/client";

export interface BundleBuilderStepDto {
    stepNumber: number;
    title: string;
    stepType: StepType;
    description: string;
}
