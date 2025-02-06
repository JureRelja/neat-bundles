// @ts-check
import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    {
        ignores: ["eslint.config.mjs"],
    },
    eslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    tseslint.configs.strict,
    tseslint.configs.stylistic,
    eslintPluginPrettierRecommended,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
            ecmaVersion: 5,
            sourceType: "module",
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/restrict-template-expressions": "off",
            "@typescript-eslint/consistent-type-definitions": ["error", { interface: "type", object: "type" }],
            "@typescript-eslint/no-inferrable-types": "off",
            "@typescript-eslintno-extraneous-class": "off",
            "@typescript-eslint/no-floating-promises": "warn",
            "@typescript-eslint/no-unsafe-argument": "warn",
            "@typescript-eslint/typedef": [
                "error",
                {
                    arrowParameter: true,
                    variableDeclaration: false,
                    memberVariableDeclaration: true,
                    arrayDestructuring: true,
                    parameter: true,
                    objectDestructuring: true,
                    propertyDeclaration: true,
                },
            ],
        },
    },
);
