// @ts-check

import eslintConfigPrettier from 'eslint-config-prettier'
// @ts-expect-error https://github.com/import-js/eslint-plugin-import/issues/3090
import eslintPluginImport from 'eslint-plugin-import'
import eslintPluginJs from '@eslint/js'
import eslintPluginStylisticJs from '@stylistic/eslint-plugin-js'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import eslintPluginX from '@txe/eslint-plugin-x'
import eslintToolingTs from 'typescript-eslint'
import { fileURLToPath } from 'node:url'
import globals from 'globals'
import { includeIgnoreFile } from '@eslint/compat'
import * as path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const gitignorePath = path.resolve(__dirname, '.gitignore')

/** @type {import('eslint').Linter.Config[]} */
export default [
  includeIgnoreFile(gitignorePath),

  eslintPluginJs.configs.recommended,
  ...eslintToolingTs.configs.strict,
  ...eslintToolingTs.configs.stylistic,
  eslintPluginImport.flatConfigs.recommended,
  eslintConfigPrettier,
  ...eslintPluginX.configs.recommended,

  {
    languageOptions: {
      globals: globals.builtin,
    },
    plugins: {
      unicorn: eslintPluginUnicorn,
      '@stylistic/js': eslintPluginStylisticJs,
    },
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: 'TSEnumDeclaration', message: 'Avoid enums' },
      ],
      'object-shorthand': ['warn', 'properties'],
      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      'import/first': 'error',
      'import/namespace': 'off',
      'import/no-duplicates': 'off',
      'import/no-empty-named-blocks': 'error',
      'import/newline-after-import': 'warn',
      'import/no-unresolved': 'off',
      'unicorn/prefer-node-protocol': 'error',
      '@typescript-eslint/parameter-properties': 'error',
      '@stylistic/js/padding-line-between-statements': [
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
    files: ['src/**/*'],
    rules: {
      'import/no-extraneous-dependencies': [
        'error',
        { devDependencies: ['src/**/*.spec.*', 'src/testing/**/*'] },
      ],
    },
  },
]
