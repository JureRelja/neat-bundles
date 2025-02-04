import { Module } from "@nestjs/common";
import { BundleBuilderService } from "./bundle-builder.service";
import { BundleBuilderController } from "./bundle-builder.controller";
import { BundleBuilderRepository } from "./bundle-builder.repository";

@Module({
    controllers: [BundleBuilderController],
    providers: [BundleBuilderService, BundleBuilderRepository],
    exports: [BundleBuilderService],
})
export class BundleBuilderModule {}
