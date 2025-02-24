"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UserEntity", {
    enumerable: true,
    get: function() {
        return UserEntity;
    }
});
const _server = require("@db/server");
let UserEntity = class UserEntity {
    constructor(){
        this.hasAppInstalled = true;
        this.activeBillingPlan = _server.PricingPlan.NONE;
        this.showTutorialBanner = true;
    }
};

//# sourceMappingURL=user.entity.js.map