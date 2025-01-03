import type { Document } from '#package/document.js'
import { invoke } from '@txe/invoke'
import { Kind } from 'graphql'
import { parse } from 'graphql'
import * as prettier from 'prettier'
import { print } from 'graphql'

export async function execExpansion({
  expand,
  schema: initialSchema,
}: {
  expand: (document: Document) => Document | Promise<Document>
  schema: string
}) {
  const initialAST = parse(initialSchema)
  const document = await expand({
    bundles: initialAST.definitions.map((node) => ({
      node,
      expansions: [],
    })),
    globals: [],
  })

  const result = await invoke(async () => {
    let x

    x = print({
      kind: Kind.DOCUMENT,
      definitions: document.bundles.flatMap((bundle) => [
        bundle.node,
        ...bundle.expansions,
      ]),
    })

    x = [
      x,
      ...document.globals.reduce((set, definition) => {
        const printed = print({
          kind: Kind.DOCUMENT,
          definitions: [definition],
        })

        set.add(printed)

        return set
      }, new Set<string>()),
    ].join('\n\n')

    x = await prettier.format(x, { parser: 'graphql' })

    return x
  })

  return result
}
