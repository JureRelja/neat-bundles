"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ProxyAuthService", {
    enumerable: true,
    get: function() {
        return ProxyAuthService;
    }
});
const _hmacsha256 = /*#__PURE__*/ _interop_require_default(require("crypto-js/hmac-sha256"));
const _enchex = /*#__PURE__*/ _interop_require_default(require("crypto-js/enc-hex"));
const _common = require("@nestjs/common");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let ProxyAuthService = class ProxyAuthService {
    authentificate(request) {
        const url = new URL(`${process.env.SHOPIFY_APP_URL}${request.originalUrl}`);
        if (this.checkSignature(url)) {
            throw new _common.UnauthorizedException("There was an error with your request. Signature is invalid.");
        }
        const shop = url.searchParams.get("shop");
        if (!shop) {
            throw new _common.UnauthorizedException("There was an error with your request. 'shop' is missing.");
        }
    }
    checkSignature(url) {
        const searchParams = url.searchParams;
        const receivedSignature = searchParams.get("signature");
        searchParams.delete("signature");
        const queryParamsForSigning = this.getUrlForSigning(searchParams);
        // Calculate the signature
        const calculatedSignature = _enchex.default.stringify((0, _hmacsha256.default)(queryParamsForSigning, process.env.NEAT_BUNDLES_DEV_SHOPIFY_API_SECRET));
        // Compare the received signature with the calculated signature
        if (receivedSignature !== calculatedSignature) {
            return false;
        }
        return true;
    }
    getUrlForSigning(queryParams) {
        const queryParamEntries = queryParams.entries();
        const arrayOfParams = [];
        // Iterate over the query params and add them to the array
        for (const paramKeyValuePair of queryParamEntries){
            arrayOfParams.push(paramKeyValuePair);
        }
        // Sort the array of params by key
        arrayOfParams.sort((a, b)=>{
            return a[0].localeCompare(b[0]);
        });
        // Create the query string
        let queryParametersString = "";
        arrayOfParams.forEach((param)=>{
            queryParametersString += `${param[0]}=${param[1]}`;
        });
        return queryParametersString;
    }
};
ProxyAuthService = _ts_decorate([
    (0, _common.Injectable)()
], ProxyAuthService);

//# sourceMappingURL=proxy-auth.service.js.map