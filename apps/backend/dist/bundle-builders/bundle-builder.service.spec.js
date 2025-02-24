"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _bundlebuilderservice = require("./bundle-builder.service");
describe("BundleBuilderService", ()=>{
    let service;
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            providers: [
                _bundlebuilderservice.BundleBuilderService
            ]
        }).compile();
        service = module.get(_bundlebuilderservice.BundleBuilderService);
    });
    it("should be defined", ()=>{
        expect(service).toBeDefined();
    });
});

//# sourceMappingURL=bundle-builder.service.spec.js.map