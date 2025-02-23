import type { InputTypeClient } from "./InputTypeClient";
import type { StepTypeClient } from "./StepTypeClient";

export type BundleStepContentClient = {
    id: number;
    stepNumber: number;
    title: string;
    description: string;
    stepType: StepTypeClient;
    contentInput: {
        id: number;
        bundleStepId: number;
        inputLabel: string;
        required: boolean;
        maxChars: number;
        inputType: InputTypeClient;
    }[];
};
