import eslintConfigPrettier from 'eslint-config-prettier'
// @ts-expect-error https://github.com/import-js/eslint-plugin-import/issues/3090
import eslintPluginImport from 'eslint-plugin-import'
import eslintPluginJs from '@eslint/js'
import eslintPluginNode from 'eslint-plugin-n'
import eslintPluginOxlint from 'eslint-plugin-oxlint'
// @ts-expect-error https://github.com/eslint-community/eslint-plugin-promise/issues/488
import eslintPluginPromise from 'eslint-plugin-promise'
import eslintPluginStylistic from '@stylistic/eslint-plugin'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import eslintPluginVitest from '@vitest/eslint-plugin'
import eslintPluginX from '@txe/eslint-plugin-x'
import eslintToolingTs from 'typescript-eslint'
import globals from 'globals'

export default eslintToolingTs.config(
  {
    name: 'package/files',
    files: ['**/*.{js,ts}'],
  },

  {
    name: 'package/ignores',
    ignores: ['dist/', 'coverage/'],
  },

  {
    name: 'package/config-files',
    files: ['*'],
    languageOptions: {
      globals: globals.node,
    },
  },

  {
    name: 'eslint',
    ...eslintPluginJs.configs.all,
  },
  {
    name: 'package/eslint-overrides',
    rules: {
      'capitalized-comments': 'off',
      'consistent-return': 'off',
      'init-declarations': 'off',
      'max-lines-per-function': 'off',
      'max-statements': 'off',
      'no-use-before-define': 'off',
      // TODO: somebody in the future, please revisit
      'no-shadow': 'off',
      'no-inline-comments': 'off',
      'one-var': 'off',

      'func-style': ['warn', 'declaration', { allowArrowFunctions: true }],
      'prefer-arrow-callback': ['warn', { allowNamedFunctions: true }],
      'id-length': ['warn', { exceptions: ['_', 'n', 'x'] }],
      'no-restricted-syntax': [
        'warn',
        { selector: 'TSEnumDeclaration', message: 'Avoid enums' },
      ],
      'object-shorthand': ['warn', 'properties'],
      'require-atomic-updates': 'warn',

      'no-warning-comments': ['error', { terms: ['fixme', 'xxx'] }],
    },
  },

  ...eslintToolingTs.configs.strict,
  ...eslintToolingTs.configs.stylistic,
  {
    name: 'package/typescript-eslint-overrides',
    rules: {
      '@typescript-eslint/parameter-properties': 'warn',
    },
  },

  eslintPluginImport.flatConfigs.recommended,
  {
    name: 'import/typescript',
    ...eslintPluginImport.flatConfigs.typescript,
  },
  {
    name: 'package/import-overrides',
    settings: {
      'import/resolver': {
        typescript: true,
      },
    },
    rules: {
      // Assuming the next 2 rules is substituted with typescript
      // https://github.com/import-js/eslint-plugin-import/issues/3101
      'import/namespace': 'off',
      // https://github.com/import-js/eslint-plugin-import/issues/3076
      // https://github.com/import-js/eslint-plugin-import/issues/1739
      'import/no-unresolved': 'off',

      'import/consistent-type-specifier-style': ['warn', 'prefer-top-level'],
      'import/newline-after-import': 'warn',
      'import/no-extraneous-dependencies': [
        'error',
        { devDependencies: ['*', 'src/**/*.spec.*', 'src/testing/**/*'] },
      ],
      'import/no-empty-named-blocks': 'warn',
    },
  },

  eslintPluginPromise.configs['flat/recommended'],

  eslintPluginUnicorn.configs['flat/all'],
  {
    name: 'package/unicorn-overrides',
    rules: {
      'unicorn/consistent-destructuring': 'off',
      'unicorn/prevent-abbreviations': [
        'warn',
        { allowList: { fn: true, args: true } },
      ],
    },
  },

  eslintPluginNode.configs['flat/recommended'],
  {
    name: 'package/node-overrides',
    rules: {
      // https://github.com/eslint-community/eslint-plugin-n/issues/75
      'n/no-missing-import': 'off',
      'n/no-unsupported-features/es-syntax': [
        'error',
        {
          ignores: ['promise-withresolvers'],
        },
      ],
    },
  },

  // @ts-expect-error somebody in the future, please
  {
    name: '@stylistic/custom',
    ...eslintPluginStylistic.configs.customize({
      arrowParens: true,
      braceStyle: '1tbs',
    }),
  },
  {
    name: 'package/@stylistic-overrides',
    rules: {
      // Resolves conflicts with prettier
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
    name: 'vitest/all',
    ...eslintPluginVitest.configs.all,
    files: ['src/**/*.spec.*'],
  },

  {
    name: 'package/vitest-overrides',
    files: ['src/**/*.spec.*'],
    rules: {
      'vitest/consistent-test-filename': [
        'warn',
        { pattern: '.*\\.spec\\.ts?$' },
      ],
      'vitest/require-top-level-describe': 'off',
      'vitest/prefer-expect-assertions': 'off',
      'vitest/no-done-callback': 'off',
    },
  },

  ...eslintPluginX.configs.recommended,
  eslintPluginOxlint.configs['flat/all'],

  {
    name: 'prettier',
    ...eslintConfigPrettier,
  },
)
