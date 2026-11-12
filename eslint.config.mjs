import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import antfu from "@antfu/eslint-config";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tailwind from "eslint-plugin-tailwindcss";

export default antfu(
  {
    react: true,
    nextjs: true,
    typescript: { tsconfigPath: "tsconfig.json" },

    // Configuration preferences
    lessOpinionated: true,
    isInEditor: false,

    // Code style
    stylistic: {
      semi: true,
    },

    // Format settings
    formatters: {
      css: true,
    },

    // Ignored paths
    ignores: [
      "migrations/**/*",
      "**/*.md",
      "eslint.config.mjs",
      "*.config.ts",
      "*.config.js",
      "*.config.mjs",
      "*.config.cjs",
    ],
  },
  // --- Accessibility Rules ---
  jsxA11y.flatConfigs.recommended,
  // --- Tailwind CSS Rules ---
  tailwind.configs.recommended,
  {
    settings: {
      tailwindcss: {
        config: `${dirname(fileURLToPath(import.meta.url))}/src/styles/global.css`,
      },
    },
  },

  // --- Custom Rule Overrides ---
  {
    files: ["src/**/*.tsx"],
    rules: {
      "tailwindcss/no-custom-classname": ["warn", {
        whitelist: ["^app-[a-z0-9-]+$"],
      }],
    },
  },
  {
    files: ["src/components/marketing/**/*.tsx", "src/app/**/(marketing)/*.tsx"],
    rules: {
      // These classes belong to the scoped editorial system in marketing.css.
      "tailwindcss/no-custom-classname": ["warn", {
        whitelist: ["^mk-[a-z0-9-]+$", "^recallo-marketing$"],
      }],
    },
  },
  {
    rules: {
      "antfu/no-top-level-await": "off", // Allow top-level await
      "style/brace-style": ["error", "1tbs"], // Use the default brace style
      "ts/consistent-type-definitions": ["error", "type"], // Use `type` instead of `interface`
      "react/prefer-destructuring-assignment": "off", // Vscode doesn't support automatically destructuring, it's a pain to add a new variable
      "node/prefer-global/process": "off", // Allow using `process.env`
      "test/padding-around-all": "error", // Add padding in test files
      "test/prefer-lowercase-title": "off", // Allow using uppercase titles in test titles
    },
  },
);
