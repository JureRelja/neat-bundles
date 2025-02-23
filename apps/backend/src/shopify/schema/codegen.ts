import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    overwrite: true,
    schema: "src/shopify/schema/shopify-storefront-schema.json",
    generates: {
        "src/shopify/types/shopify-storefront-types.ts": {
            plugins: ["typescript", "typescript-resolvers", "typescript-document-nodes"],
        },
        "src/shopify/schema/storefront-graphql.schema.json": {
            plugins: ["introspection"],
        },
    },
};

export default config;
