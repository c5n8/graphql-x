import cleanup from '#package/cleanup/index.js'
import type { Document } from '#package/document.js'
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

  const document: Document = {
    bundles: ast.definitions.map((node) => ({
      node,
      expansions: [],
    })),
    globals: [],
  }

  for (const transformer of transformers) {
    const { default: transform } = transformer

    transform(document)
  }

  const cleaned = cleanup({
    kind: Kind.DOCUMENT,
    definitions: document.bundles.flatMap((bundle) => [
      bundle.node,
      ...bundle.expansions,
    ]),
  })

  const result = [
    print(cleaned),
    ...document.globals.reduce((set, definition) => {
      const printed = print({
        kind: Kind.DOCUMENT,
        definitions: [definition],
      })

      set.add(printed)

      return set
    }, new Set<string>()),
  ].join('\n\n')

  return result
}
