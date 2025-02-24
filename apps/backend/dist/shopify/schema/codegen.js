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
const config = {
    overwrite: true,
    schema: "src/shopify/schema/shopify-storefront-schema.json",
    generates: {
        "src/shopify/types/shopify-storefront-types.ts": {
            plugins: [
                "typescript",
                "typescript-resolvers",
                "typescript-document-nodes"
            ]
        },
        "src/shopify/schema/storefront-graphql.schema.json": {
            plugins: [
                "introspection"
            ]
        }
    }
};
const _default = config;

//# sourceMappingURL=codegen.js.map