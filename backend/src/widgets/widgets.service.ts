import { Injectable } from "@nestjs/common";
import { BundleBuilderService } from "~/bundle-builders/bundle-builder.service";
import { BundleBuilderAndStepsBasicDto } from "../bundle-builders/dto/bundle-builder-basic.dto";
import { BundleBuilderWidgetDto } from "./dto/BundleBuilderWidgetDto";

@Injectable()
export class WidgetsService {
    constructor(private readonly bundleBuilderService: BundleBuilderService) {}

    async getWidget(bundleId: number, shop: string): Promise<BundleBuilderWidgetDto> {
        try {
            const bundleBuilder: BundleBuilderAndStepsBasicDto | null = (await this.bundleBuilderService.findOne(bundleId, shop, true)) as BundleBuilderAndStepsBasicDto | null;

            return new BundleBuilderWidgetDto(bundleBuilder);
        } catch (error) {
            return new BundleBuilderWidgetDto(null);
        }
    }
}
