"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _client = require("@prisma/client");
const prisma = globalThis.prisma || new _client.PrismaClient();
if (process.env.NODE_ENV !== "production") {
    if (!globalThis.prisma) {
        globalThis.prisma = new _client.PrismaClient();
    }
}
const _default = prisma;

//# sourceMappingURL=db.server.js.map