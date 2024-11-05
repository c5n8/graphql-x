// @ts-check

import { ESLintUtils } from '@typescript-eslint/utils'

export default ESLintUtils.RuleCreator((name) => `txe/${name}`)({
  name: '',
  defaultOptions: [],
  meta: {
    fixable: 'code',
    docs: {
      description: '',
    },
    messages: {
      avoidMultipleSpecifiersImports:
        'Avoid multiple specifiers on import declarations.',
      avoidUnsortedImports:
        'Import declarations should be sorted by the specifier.',
    },
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
            messageId: 'avoidMultipleSpecifiersImports',
            fix: (fixer) => {
              const fix = declaration.specifiers
                .map((specifier) => {
                  if (specifier.type === 'ImportSpecifier') {
                    let segments = [`import`]

                    if (
                      declaration.importKind === 'type' ||
                      specifier.importKind === 'type'
                    ) {
                      segments.push('type')
                    }

                    segments.push(`{`)

                    const importedName =
                      'name' in specifier.imported
                        ? specifier.imported.name
                        : specifier.imported.value

                    if (importedName !== specifier.local.name) {
                      segments.push(`${importedName} as`)
                    }

                    segments.push(
                      `${specifier.local.name} } from '${declaration.source.value}';`,
                    )

                    return segments.join(' ')
                  }

                  if (specifier.type === 'ImportDefaultSpecifier') {
                    let segments = ['import']

                    if (declaration.importKind === 'type') {
                      segments.push('type')
                    }

                    segments.push(
                      `${specifier.local.name} from '${declaration.source.value}';`,
                    )

                    return segments.join(' ')
                  }

                  if (specifier.type === 'ImportNamespaceSpecifier') {
                    return `import * as ${specifier.local.name} from '${declaration.source.value}';`
                  }
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
        messageId: 'avoidUnsortedImports',
        fix: (fixer) => {
          const fix = sortedDeclarations
            .map((declaration) => sourceCode.getText(declaration))
            .join('\n')

          const start = importDeclarations[0].range[0]
          const end = importDeclarations[importDeclarations.length - 1].range[1]

          return fixer.replaceTextRange([start, end], fix)
        },
      })
    },
  }),
})
