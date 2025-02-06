import { BundleBuilder } from "./bundle_builder";
import { ContentInput } from "./content_input";
import { ProductInput } from "./product_input";
import { StepType } from "@prisma/client";

export class BundleBuilderStep {
    id: number;

    stepNumber: number;

    title: string;

    stepType: StepType;

    description: string;

    bundleBuilderId: number;

    BundleBuilder: BundleBuilder;

    ContentInput: ContentInput[];

    ProductInput?: ProductInput;
}
