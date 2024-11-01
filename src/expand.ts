import { Kind, parse, print } from 'graphql'
import * as prettier from 'prettier'
import cleanup from '#app/cleanup/index.js'
import { type Document } from '#app/types/document.js'

export async function expand(schema: string) {
  const transformers = await Promise.all([
    import('#app/transformers/directives/create/index.js'),
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
    definitions: document.bundles.flatMap((bundle) => {
      return [bundle.node, ...bundle.expansions]
    }),
  })

  const result = [
    print(cleaned),
    ...Array.from(
      document.globals.reduce((set, definition) => {
        const printed = print({
          kind: Kind.DOCUMENT,
          definitions: [definition],
        })

        set.add(printed)

        return set
      }, new Set<string>()),
    ),
  ].join('\n\n')

  const formatted = await prettier.format(result, { parser: 'graphql' })

  return formatted
}
