import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";


export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], languageOptions: { globals: globals.browser } },
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"] },
  tseslint.configs.recommended,
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], plugins: { pluginReact }, extends: ["plugin:react/recommended"], settings: { react: { version: "detect" } } },
  pluginReact.configs.flat.recommended,
  {
    files: ["next/**/*.{js,mjs,cjs,ts,tsx,jsx}"],
    plugins: {
      next: "recommended",
    },
  },
]);