"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _bundlebuildercontroller = require("./bundle-builder.controller");
const _bundlebuilderservice = require("./bundle-builder.service");
describe("BundleBuilderController", ()=>{
    let controller;
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            controllers: [
                _bundlebuildercontroller.BundleBuilderController
            ],
            providers: [
                _bundlebuilderservice.BundleBuilderService
            ]
        }).compile();
        controller = module.get(_bundlebuildercontroller.BundleBuilderController);
    });
    it("should be defined", ()=>{
        expect(controller).toBeDefined();
    });
});

//# sourceMappingURL=bundle-builder.controller.spec.js.map