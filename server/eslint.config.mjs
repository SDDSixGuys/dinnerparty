import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.ts"],
    extends: [js.configs.recommended, tseslint.configs.recommended, eslintConfigPrettier],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
    },
    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        // Default: camelCase for everything not covered below
        { selector: "default", format: ["camelCase"] },
        // Variables: camelCase or UPPER_CASE for module-level constants
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
        },
        // Parameters: camelCase, leading underscore allowed for intentionally unused params
        { selector: "parameter", format: ["camelCase"], leadingUnderscore: "allow" },
        // Imports: camelCase or PascalCase (Mongoose models etc. are PascalCase)
        { selector: "import", format: ["camelCase", "PascalCase"] },
        // Object properties: camelCase or UPPER_CASE (env var objects) for valid identifier names
        {
          selector: "property",
          filter: { regex: "^[a-zA-Z_][a-zA-Z0-9_]*$", match: true },
          format: ["camelCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
        },
        // Skip format enforcement for non-identifier property keys (e.g. "Content-Type")
        {
          selector: "property",
          filter: { regex: "^[a-zA-Z_][a-zA-Z0-9_]*$", match: false },
          format: null,
        },
        // Functions: camelCase only on the server (no React components here)
        { selector: "function", format: ["camelCase"] },
        // Types, interfaces, classes, enums: PascalCase
        { selector: "typeLike", format: ["PascalCase"] },
      ],
    },
  },
]);
