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
const _client = require("@prisma/client");
let UserEntity = class UserEntity {
    constructor(){
        this.hasAppInstalled = true;
        this.activeBillingPlan = _client.PricingPlan.NONE;
        this.showTutorialBanner = true;
    }
};

//# sourceMappingURL=user.entity.js.map