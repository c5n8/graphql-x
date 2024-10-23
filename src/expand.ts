import type { Document } from '#app/document.js'
import { Kind, parse, print } from 'graphql'
import * as prettier from 'prettier'

export async function expand(schema: string) {
  const ast = parse(schema)

  const document: Document = {
    bundles: ast.definitions.map((node) => ({
      node,
      expansions: [],
    })),
    globals: [],
  }

  const transformers = await Promise.all([
    import('#app/transformers/directives/create/index.js'),
  ])

  for (const transformer of transformers) {
    const { default: transform } = transformer

    transform(document)
  }

  const result =
    print({
      kind: Kind.DOCUMENT,
      definitions: document.bundles.flatMap((bundle) => {
        return [bundle.node, ...bundle.expansions]
      }),
    }) +
    '\n' +
    '\n' +
    Array.from(
      document.globals.reduce((set, definition) => {
        const printed = print({
          kind: Kind.DOCUMENT,
          definitions: [definition],
        })

        set.add(printed)

        return set
      }, new Set<string>()),
    ).join()

  const formatted = await prettier.format(result, { parser: 'graphql' })

  return formatted
}
