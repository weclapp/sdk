import tsEslint from "typescript-eslint";

export default tsEslint.config({
  extends: [...tsEslint.configs.recommendedTypeChecked],
  languageOptions: {
    sourceType: "module",
    ecmaVersion: 2022,
    parserOptions: {
      projectService: true,
    },
  },
  rules: {
    "no-console": "error",
  },
});
