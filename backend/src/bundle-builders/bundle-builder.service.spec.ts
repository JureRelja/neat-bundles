import { Test, TestingModule } from "@nestjs/testing";
import { BundleBuilderService } from "./bundle-builder.service";

describe("BundleBuilderService", () => {
    let service: BundleBuilderService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [BundleBuilderService],
        }).compile();

        service = module.get<BundleBuilderService>(BundleBuilderService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
