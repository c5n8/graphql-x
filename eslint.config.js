import eslintConfigPrettier from 'eslint-config-prettier'
// @ts-expect-error https://github.com/import-js/eslint-plugin-import/issues/3090
import eslintPluginImport from 'eslint-plugin-import'
import eslintPluginJs from '@eslint/js'
import eslintPluginOxlint from 'eslint-plugin-oxlint'
import eslintPluginStylistic from '@stylistic/eslint-plugin'
import eslintPluginVitest from '@vitest/eslint-plugin'
import eslintPluginX from '@txe/eslint-plugin-x'
import eslintToolingTs from 'typescript-eslint'
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

  {
    files: ['*'],
    languageOptions: {
      globals: globals.node,
    },
  },

  eslintPluginJs.configs.all,
  {
    rules: {
      'capitalized-comments': 'off',
      'consistent-return': 'off',
      'init-declarations': 'off',
      'max-lines-per-function': 'off',
      'max-statements': 'off',
      'no-use-before-define': 'off',
      // TODO: somebody in the future, please revisit
      'no-shadow': 'off',
      'one-var': 'off',

      'func-style': ['warn', 'declaration', { allowArrowFunctions: true }],
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

      'import/consistent-type-specifier-style': ['warn', 'prefer-top-level'],
      'import/newline-after-import': 'warn',
      'import/no-extraneous-dependencies': [
        'error',
        { devDependencies: ['*', 'src/**/*.spec.*', 'src/testing/**/*'] },
      ],
      'import/no-empty-named-blocks': 'warn',
    },
  },

  // @ts-expect-error somebody in the future, please
  eslintPluginStylistic.configs.customize({
    arrowParens: true,
    braceStyle: '1tbs',
  }),
  {
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
    ...eslintPluginVitest.configs.all,
    files: ['src/**/*.spec.*'],
  },
  {
    rules: {
      'vitest/consistent-test-filename': 'off',
      'vitest/require-top-level-describe': 'off',
      'vitest/prefer-expect-assertions': 'off',
    },
  },

  ...eslintPluginX.configs.recommended,
  eslintPluginOxlint.configs['flat/all'],
  eslintConfigPrettier,
)
