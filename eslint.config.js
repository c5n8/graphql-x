// @ts-check

import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { includeIgnoreFile } from '@eslint/compat'
import eslint from '@eslint/js'
import prettierConfig from 'eslint-config-prettier'
// @ts-expect-error https://github.com/import-js/eslint-plugin-import/issues/3090
import importPlugin from 'eslint-plugin-import'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import globals from 'globals'
import tslint from 'typescript-eslint'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const gitignorePath = path.resolve(__dirname, '.gitignore')

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */
export default [
  eslint.configs.recommended,

  ...tslint.configs.strict,
  ...tslint.configs.stylistic,

  {
    languageOptions: {
      globals: globals.builtin,
    },
    plugins: {
      unicorn: eslintPluginUnicorn,
    },
    rules: {
      'unicorn/prefer-node-protocol': 'error',
    },
  },

  importPlugin.flatConfigs.recommended,
  {
    rules: {
      'import/order': [
        'error',
        {
          named: {
            enabled: true,
            types: 'types-last',
          },
          alphabetize: {
            order: 'asc',
          },
        },
      ],
      'import/consistent-type-specifier-style': ['error', 'prefer-inline'],
      'import/no-duplicates': [
        'error',
        {
          'prefer-inline': true,
          considerQueryString: true,
        },
      ],
      'import/namespace': ['off'],
      'import/no-unresolved': ['off'],
    },
  },

  {
    rules: {
      'object-shorthand': ['error', 'properties'],
    },
  },

  prettierConfig,
  includeIgnoreFile(gitignorePath),
]
