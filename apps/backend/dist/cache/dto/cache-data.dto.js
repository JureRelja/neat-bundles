"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CacheData", {
    enumerable: true,
    get: function() {
        return CacheData;
    }
});
let CacheData = class CacheData {
    constructor(statusCode, headers, data){
        this.statusCode = statusCode;
        this.headers = headers;
        this.data = data;
    }
};

//# sourceMappingURL=cache-data.dto.js.map