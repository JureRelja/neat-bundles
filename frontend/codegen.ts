import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    schema: "./shopify-schema.json",
    documents: ["src/**/*.tsx"],
    ignoreNoDocuments: true, // for better experience with the watcher
    generates: {
        "app/adminBackend/shopifyGraphql/": {
            preset: "client",
        },
    },
};

export default config;
