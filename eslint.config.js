// @ts-check

import eslint from '@eslint/js'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import eslintPluginX from './modules/eslint-plugin-x/index.js'
import { fileURLToPath } from 'node:url'
import globals from 'globals'
// @ts-expect-error https://github.com/import-js/eslint-plugin-import/issues/3090
import importPlugin from 'eslint-plugin-import'
import { includeIgnoreFile } from '@eslint/compat'
import * as path from 'node:path'
import prettierConfig from 'eslint-config-prettier'
import stylisticJs from '@stylistic/eslint-plugin-js'
import tslint from 'typescript-eslint'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const gitignorePath = path.resolve(__dirname, '.gitignore')

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray} */
export default [
  eslint.configs.recommended,
  {
    rules: {
      'object-shorthand': ['warn', 'properties'],
    },
  },

  ...tslint.configs.strict,
  ...tslint.configs.stylistic,
  {
    rules: {
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'TSEnumDeclaration',
          message: "Don't declare enums",
        },
        {
          selector: 'TSParameterProperty',
          message: "Don't use class parameter property",
        },
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
      x: eslintPluginX,
    },
    rules: {
      'x/organize-imports': 'warn',
    },
  },

  importPlugin.flatConfigs.recommended,
  {
    rules: {
      'import/no-unresolved': 'off',
      'import/no-duplicates': 'off',
      'import/namespace': 'off',
      'import/no-empty-named-blocks': 'warn',
      'import/consistent-type-specifier-style': ['warn', 'prefer-top-level'],
    },
  },

  {
    plugins: {
      '@stylistic/js': stylisticJs,
    },
    rules: {
      '@stylistic/js/padding-line-between-statements': [
        'warn',
        { blankLine: 'always', prev: '*', next: 'block-like' },
        { blankLine: 'always', prev: 'block-like', next: '*' },
        { blankLine: 'always', prev: ['case', 'default'], next: '*' },
        { blankLine: 'always', prev: '*', next: 'return' },
      ],
    },
  },

  prettierConfig,
  includeIgnoreFile(gitignorePath),
]
