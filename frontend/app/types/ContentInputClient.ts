import type { InputTypeClient } from "./InputTypeClient";

export type ContentInputClient = {
    id: number;
    bundleStepId: number;
    inputType: InputTypeClient;
    inputLabel: string;
    maxChars: number;
    required: boolean;
};
