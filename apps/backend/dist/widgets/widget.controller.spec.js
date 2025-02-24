"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _widgetscontroller = require("./widgets.controller");
describe("WidgetsController", ()=>{
    let controller;
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            controllers: [
                _widgetscontroller.WidgetsController
            ]
        }).compile();
        controller = module.get(_widgetscontroller.WidgetsController);
    });
    it("should be defined", ()=>{
        expect(controller).toBeDefined();
    });
});

//# sourceMappingURL=widget.controller.spec.js.map