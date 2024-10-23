// @ts-check

import { includeIgnoreFile } from '@eslint/compat'
import eslint from '@eslint/js'
import prettierConfig from 'eslint-config-prettier'
import * as path from 'path'
import tslint from 'typescript-eslint'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const gitignorePath = path.resolve(__dirname, '.gitignore')

export default tslint.config(
  eslint.configs.recommended,
  ...tslint.configs.strict,
  ...tslint.configs.stylistic,
  prettierConfig,
  includeIgnoreFile(gitignorePath),
  {
    rules: {
      'object-shorthand': ['error', 'properties'],
    },
  },
)
