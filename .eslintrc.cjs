/** @type {import('@types/eslint').Linter.BaseConfig} */
module.exports = {
    root: true,
    extends: ["@remix-run/eslint-config", "@remix-run/eslint-config/node", "@remix-run/eslint-config/jest-testing-library", "prettier"],
    globals: {
        shopify: "readonly",
    },
    rules: {
        "@typescript-eslint/consistent-type-imports": "error",
    },
};

// module.exports = {
//     root: true,
//     extends: ["@remix-run/eslint-config", "@remix-run/eslint-config/node", "@remix-run/eslint-config/jest-testing-library", "prettier"],
//     globals: {
//         shopify: "readonly",
//     },
//     rules: {
//         "@typescript-eslint/typedef": [
//             "error",
//             {
//                 arrowParameter: true,
//                 variableDeclaration: true,
//                 memberVariableDeclaration: true,
//                 parameter: true,
//                 propertyDeclaration: true,
//                 functionDeclaration: true,
//                 functionExpression: true,
//                 methodDeclaration: true,
//             },
//         ],
//     },
// };
