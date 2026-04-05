import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["packages/dino-ge/src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./packages/dino-ge/tsconfig.json",
      },
      globals: {
        ...globals.browser,
        ...globals.es2015,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
    },
  },
  {
    ignores: ["node_modules/", "packages/*/dist/", "packages/*/built/", "docs/api/"],
  },
];
