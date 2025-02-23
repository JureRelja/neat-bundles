import { Test, TestingModule } from "@nestjs/testing";
import { BundleBuilderController } from "./bundle-builder.controller";
import { BundleBuilderService } from "./bundle-builder.service";

describe("BundleBuilderController", () => {
    let controller: BundleBuilderController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BundleBuilderController],
            providers: [BundleBuilderService],
        }).compile();

        controller = module.get<BundleBuilderController>(BundleBuilderController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
