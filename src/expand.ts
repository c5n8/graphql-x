import { cleanup } from '#package/cleanup/index.js'
import { createBundle } from '#package/document.js'
import { createDocument } from '#package/document.js'
import type { Document } from '#package/document.js'
import { invoke } from '@txe/invoke'
import { Kind } from 'graphql'
import { parse } from 'graphql'
import { print } from 'graphql'

export async function expand(schema: string) {
  const transformers = await Promise.all([
    import('#package/macros/create/index.js'),
    import('#package/macros/update/index.js'),
    import('#package/macros/delete/index.js'),
    import('#package/macros/list/index.js'),
    import('#package/macros/item/index.js'),
  ])

  const ast = parse(schema)

  const document: Document = createDocument({
    bundles: ast.definitions.map((node) =>
      createBundle({
        node,
        directives: invoke(() => {
          if (
            node.kind === Kind.OBJECT_TYPE_DEFINITION &&
            node.directives !== undefined
          ) {
            return node.directives.map((directive) => directive.name.value)
          }

          return []
        }),
      }),
    ),
  })

  for (const transformer of transformers) {
    const { default: transform } = transformer

    transform(document)
  }

  return invoke(() => {
    let x

    x = cleanup(document)

    x = x.bundles.flatMap((bundle) => [
      print(bundle.node),
      ...bundle.directives.flatMap((directive) => {
        if (bundle.groupedExpansions[directive] !== undefined) {
          const type =
            bundle.node.kind === Kind.OBJECT_TYPE_DEFINITION &&
            bundle.node.name.value

          return [
            `# start: @${directive} ${type}`,

            ...bundle.groupedExpansions[directive].map((expansion) =>
              print(expansion),
            ),
            `# end: @${directive} ${type}`,
          ].join('\n\n')
        }

        return []
      }),
    ])

    x = x.join('\n\n')

    x = [
      x,
      // oxlint-disable-next-line eslint(no-ternary)
      ...(document.globals.length > 0 ? [`# start: globals`] : []),
      ...document.globals.reduce((set, definition) => {
        const printed = print({
          kind: Kind.DOCUMENT,
          definitions: [definition],
        })

        set.add(printed)

        return set
      }, new Set<string>()),
      // oxlint-disable-next-line eslint(no-ternary)
      ...(document.globals.length > 0 ? [`# end: globals`] : []),
    ].join('\n\n')

    return x
  })
}
