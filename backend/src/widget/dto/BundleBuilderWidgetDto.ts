import { BundleBuilderAndStepsBasicDto } from "~/bundle-builders/dto/bundle-builder-basic.dto";

export class BundleBuilderWidgetDto {
    constructor(bundleBuilder: BundleBuilderAndStepsBasicDto | null) {
        this.bundleBuilder = bundleBuilder;
    }

    bundleBuilder: BundleBuilderAndStepsBasicDto | null;
}
