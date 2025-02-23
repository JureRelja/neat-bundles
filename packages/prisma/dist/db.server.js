"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const client_1 = require("@prisma/client");
const prisma = globalThis.prisma || new client_1.PrismaClient();
if (process.env.NODE_ENV !== "production") {
    if (!globalThis.prisma) {
        globalThis.prisma = new client_1.PrismaClient();
    }
}
// export * from ".prisma/client/index.d";
exports.db = prisma;
