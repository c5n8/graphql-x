import eslintConfigPrettier from 'eslint-config-prettier'
// @ts-expect-error https://github.com/import-js/eslint-plugin-import/issues/3090
import eslintPluginImport from 'eslint-plugin-import'
import eslintPluginJs from '@eslint/js'
import eslintPluginStylistic from '@stylistic/eslint-plugin'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import eslintPluginX from '@txe/eslint-plugin-x'
import eslintToolingTs from 'typescript-eslint'
import { fileURLToPath } from 'node:url'
import globals from 'globals'
import { includeIgnoreFile } from '@eslint/compat'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const gitignorePath = path.resolve(__dirname, '.gitignore')

export default eslintToolingTs.config(
  includeIgnoreFile(gitignorePath),

  eslintPluginJs.configs.recommended,
  {
    rules: {
      'object-shorthand': ['warn', 'properties'],
      'no-restricted-syntax': [
        'warn',
        { selector: 'TSEnumDeclaration', message: 'Avoid enums' },
      ],
    },
  },

  // eslint-disable-next-line import/no-named-as-default-member
  ...eslintToolingTs.configs.strict,
  // eslint-disable-next-line import/no-named-as-default-member
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
      'import/consistent-type-specifier-style': ['warn', 'prefer-top-level'],
      'import/first': 'error',
      'import/namespace': 'warn',
      'import/no-duplicates': 'off',
      'import/no-empty-named-blocks': 'warn',
      'import/newline-after-import': 'warn',
      // https://github.com/import-js/eslint-plugin-import/issues/3076
      'import/no-unresolved': 'off',
    },
  },
  {
    files: ['src/**/*'],
    rules: {
      'import/no-extraneous-dependencies': [
        'error',
        { devDependencies: ['src/**/*.spec.*', 'src/testing/**/*'] },
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

  {
    plugins: {
      // @ts-expect-error https://github.com/eslint-stylistic/eslint-stylistic/issues/398
      '@stylistic': eslintPluginStylistic,
    },
    rules: {
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
    files: ['*'],
    languageOptions: {
      globals: globals.node,
    },
  },

  eslintConfigPrettier,
  ...eslintPluginX.configs.recommended,
)
