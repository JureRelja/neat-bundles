import { BundleBuilderStep } from "./bundle_builder_step";
import { InputType } from "@prisma/client";

export class ContentInput {
    id: number;

    bundleStepId: number;

    inputType: InputType;

    inputLabel: string;

    maxChars: number;

    required: boolean;

    BundleStep: BundleBuilderStep;
}
