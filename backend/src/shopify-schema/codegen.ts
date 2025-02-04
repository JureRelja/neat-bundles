import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    overwrite: true,
    schema: "src/shopify-schema/shopify-schema.json",
    generates: {
        "src/shopify-schema/shopify-schema.ts": {
            plugins: ["typescript", "typescript-resolvers", "typescript-document-nodes"],
        },
        "src/shopify-schema/graphql.schema.json": {
            plugins: ["introspection"],
        },
    },
};

export default config;
