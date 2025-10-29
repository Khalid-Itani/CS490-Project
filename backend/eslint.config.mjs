// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Ignore files
  {
    ignores: ['eslint.config.mjs'],
  },

  // Recommended ESLint base rules
  eslint.configs.recommended,

  // TypeScript ESLint recommended with type-checking
  ...tseslint.configs.recommendedTypeChecked,

  // Prettier plugin + config
  eslintPluginPrettierRecommended,

  // Language + environment settings
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
    },
  },

  // Custom rules override
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',

      // Prettier formatting rule
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  }
);
