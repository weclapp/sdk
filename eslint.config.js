import tsEslint from 'typescript-eslint';

export default tsEslint.config(
  {
    name: 'app/files-to-ignore',
    ignores: ['**/*.d.ts', '**/.*', '**/dist', '**/sdk', '**/node_modules']
  },
  {
    extends: [...tsEslint.configs.recommendedTypeChecked],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 2022,
      parserOptions: {
        projectService: true
      }
    },
    rules: {
      'no-console': 'error'
    }
  }
);
