// @ts-check

import eslint from '@eslint/js'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import { ESLintUtils } from '@typescript-eslint/utils'
import { fileURLToPath } from 'node:url'
import globals from 'globals'
import importPlugin from 'eslint-plugin-import'
import { includeIgnoreFile } from '@eslint/compat'
import * as path from 'node:path'
import prettierConfig from 'eslint-config-prettier'
import tslint from 'typescript-eslint'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const gitignorePath = path.resolve(__dirname, '.gitignore')

const rule_organized_imports = ESLintUtils.RuleCreator((name) => `txe/${name}`)(
  {
    name: '',
    defaultOptions: [],
    meta: {
      fixable: 'code',
      docs: {
        description: '',
      },
      messages: {},
      schema: [],
      type: 'problem',
    },
    create: (context) => ({
      Program: (program) => {
        const sourceCode = context.getSourceCode()
        const importDeclarations = program.body.filter(
          (node) => node.type === 'ImportDeclaration',
        )

        if (importDeclarations.length === 0) {
          return
        }

        if (
          importDeclarations.some(
            (declaration) => declaration.specifiers.length > 1,
          )
        ) {
          for (const declaration of importDeclarations) {
            if (declaration.specifiers.length <= 1) {
              continue
            }

            context.report({
              node: declaration,
              message: 'Only one import is allowed per import statement.',
              fix: (fixer) => {
                const fix = declaration.specifiers
                  .map((specifier) => {
                    const fixes = {
                      ImportSpecifier: () => {
                        let segments = [`import`]

                        if (
                          declaration.importKind === 'type' ||
                          specifier.importKind === 'type'
                        ) {
                          segments.push('type')
                        }

                        segments.push(`{`)

                        if (specifier.imported.name !== specifier.local.name) {
                          segments.push(`${specifier.imported.name} as`)
                        }

                        segments.push(
                          `${specifier.local.name} } from '${declaration.source.value}';`,
                        )

                        return segments.join(' ')
                      },
                      ImportDefaultSpecifier: () => {
                        let segments = ['import']

                        if (declaration.importKind === 'type') {
                          segments.push('type')
                        }

                        segments.push(
                          `${specifier.local.name} from '${declaration.source.value}';`,
                        )

                        return segments.join(' ')
                      },
                      ImportNamespaceSpecifier: () =>
                        `import * as ${specifier.local.name} from '${declaration.source.value}';`,
                    }

                    return fixes[specifier.type]()
                  })
                  .join('\n')

                return fixer.replaceText(declaration, fix)
              },
            })
          }

          return
        }

        const sortedDeclarations = [...importDeclarations].sort((a, b) => {
          const aa = a.specifiers[0]
          const bb = b.specifiers[0]

          if (aa == null && bb == null) {
            return 0
          }

          if (aa == null) {
            return -1
          }

          if (bb == null) {
            return 1
          }

          return aa.local.name.localeCompare(bb.local.name)
        })

        const isSorted = importDeclarations.every(
          (declaration, index) => declaration === sortedDeclarations[index],
        )

        if (isSorted) {
          return
        }

        context.report({
          node: importDeclarations[0],
          message: 'Import declarations should be sorted by the imported name.',
          /** @param {import('@typescript-eslint/utils/ts-eslint').RuleFixer} fixer */
          fix: (fixer) => {
            const fix = sortedDeclarations
              .map((declaration) => sourceCode.getText(declaration))
              .join('\n')

            const start = importDeclarations[0].range[0]
            const end =
              importDeclarations[importDeclarations.length - 1].range[1]
            return fixer.replaceTextRange([start, end], fix)
          },
        })
      },
    }),
  },
)

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray} */
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

  {
    plugins: {
      txe: {
        rules: {
          'organize-imports': rule_organized_imports,
        },
      },
    },
    rules: {
      'txe/organize-imports': 'error',
    },
  },

  importPlugin.flatConfigs.recommended,
  {
    rules: {
      'import/no-unresolved': 'off',
      'import/no-duplicates': 'off',
      'import/namespace': 'off',
      'import/no-empty-named-blocks': 'error',
      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
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
