import type { StepTypeClient } from "./StepTypeClient";

export type BundleBuilderStepClient = {
    id: number;
    bundleBuilderId: number;
    stepNumber: number;
    title: string;
    description: string;
    stepType: StepTypeClient;
};
