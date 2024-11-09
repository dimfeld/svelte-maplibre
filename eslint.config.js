import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export function createConfig(withSvelte = false) {
  return [
    js.configs.recommended,
    ...ts.configs.recommended,
    ...(withSvelte ? svelte.configs['flat/recommended'] : []),
    prettier,
    ...(withSvelte ? svelte.configs['flat/prettier'] : []),
    {
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.node,
        },
      },
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        'prefer-const': 'off',
      },
    },

    withSvelte
      ? {
          files: ['**/*.svelte'],
          languageOptions: {
            parserOptions: {
              parser: ts.parser,
            },
          },
          rules: {
            // This ends up duplicating the svelte warnings in the editor
            'svelte/valid-compile': 'off',
          },
        }
      : null,

    {
      ignores: ['**/build/', '**/.svelte-kit/', '**/dist/', '**/playwright-report/'],
    },
  ].filter((x) => x != null);
}

/** @type {import('eslint').Linter.Config[]} */
export default createConfig(false);
