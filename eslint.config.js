import eslintConfigPrettier from 'eslint-config-prettier'
// @ts-expect-error https://github.com/import-js/eslint-plugin-import/issues/3090
import eslintPluginImport from 'eslint-plugin-import'
import eslintPluginJs from '@eslint/js'
import eslintPluginStylistic from '@stylistic/eslint-plugin'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import eslintPluginVitest from '@vitest/eslint-plugin'
import eslintPluginX from '@txe/eslint-plugin-x'
import * as eslintToolingTs from 'typescript-eslint'
import globals from 'globals'
import { invoke } from '@txe/invoke'

export default eslintToolingTs.config(
  {
    name: 'package/files-to-lint',
    files: ['**/*.{js,ts}'],
  },

  {
    name: 'package/files-to-ignore',
    ignores: ['dist/**', 'coverage/**'],
  },

  eslintPluginJs.configs.all,
  {
    rules: {
      'max-lines-per-function': 'off',
      'max-statements': 'off',
      'max-params': 'off',
      'max-lines': 'off',

      'capitalized-comments': 'off',
      'no-duplicate-imports': 'off',
      'one-var': 'off',
      'sort-keys': 'off',
      'sort-imports': 'off',
      'init-declarations': 'off',
      'no-eq-null': 'off',
      'func-names': 'off',
      'no-use-before-define': 'off',
      'no-magic-numbers': 'off',
      'consistent-return': ['off'],

      'no-shadow': 'warn',
      'no-await-in-loop': 'warn',
      'no-console': 'warn',
      'no-continue': 'warn',
      'require-atomic-updates': 'warn',
      'id-length': ['warn', { exceptions: ['_', 'n', 'x'] }],
      'func-style': ['warn', 'declaration', { allowArrowFunctions: true }],
      'object-shorthand': ['warn', 'properties'],
      'no-restricted-syntax': [
        'warn',
        { selector: 'TSEnumDeclaration', message: 'Avoid enums' },
      ],

      'eqeqeq': ['error', 'smart'],
      'no-warning-comments': ['error', { terms: ['fixme', 'xxx'] }],
    },
  },

  ...eslintToolingTs.configs.strict,
  ...eslintToolingTs.configs.stylistic,
  {
    rules: {
      '@typescript-eslint/parameter-properties': 'warn',
    },
  },

  eslintPluginImport.flatConfigs.recommended,
  eslintPluginImport.flatConfigs.typescript,
  {
    settings: {
      'import/resolver': {
        typescript: true,
      },
    },
    rules: {
      'import/no-duplicates': 'off',

      'import/consistent-type-specifier-style': ['warn', 'prefer-top-level'],
      'import/no-empty-named-blocks': 'warn',
      ...invoke(() => {
        if (process.env.NODE_ENV === 'development') {
          return {
            // https://github.com/import-js/eslint-plugin-import/issues/3101
            'import/namespace': 'off',
            // https://github.com/import-js/eslint-plugin-import/issues/3076
            // https://github.com/import-js/eslint-plugin-import/issues/1739
            'import/no-unresolved': 'off',
          }
        }

        return {
          'import/namespace': 'warn',
          'import/no-unresolved': 'warn',
        }
      }),
      'import/newline-after-import': 'warn',

      'import/first': 'error',
      'import/no-extraneous-dependencies': [
        'error',
        { devDependencies: ['*', 'src/**/*.spec.*', 'src/testing/**/*'] },
      ],
    },
  },

  {
    languageOptions: {
      globals: globals.builtin,
    },
    plugins: {
      unicorn: eslintPluginUnicorn,
    },
    rules: {
      'unicorn/prefer-node-protocol': 'warn',
    },
  },

  // @ts-expect-error somebody in the future, please
  eslintPluginStylistic.configs.customize({
    arrowParens: true,
    braceStyle: '1tbs',
  }),
  {
    plugins: {
      // https://github.com/eslint-stylistic/eslint-stylistic/issues/398
      '@stylistic': eslintPluginStylistic,
    },
    rules: {
      // resolves conflicts with prettier
      '@stylistic/indent': ['off'],
      '@stylistic/indent-binary-ops': ['off'],
      '@stylistic/operator-linebreak': ['off'],
      //

      '@stylistic/padding-line-between-statements': [
        'warn',
        { blankLine: 'never', prev: 'import', next: 'import' },
        { blankLine: 'always', prev: '*', next: 'block-like' },
        { blankLine: 'always', prev: 'block-like', next: '*' },
        { blankLine: 'always', prev: ['case', 'default'], next: '*' },
        { blankLine: 'always', prev: '*', next: 'return' },
      ],
    },
  },

  {
    ...eslintPluginVitest.configs.recommended,
    files: ['src/**/*.spec.*'],
  },

  ...eslintPluginX.configs.recommended,

  {
    files: ['*'],
    languageOptions: {
      globals: globals.node,
    },
  },

  eslintConfigPrettier,
)
