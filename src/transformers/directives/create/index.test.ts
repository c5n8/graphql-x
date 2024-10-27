import { expect, test } from 'vitest'
import { buildASTSchema, Kind, parse, print } from 'graphql'
import * as prettier from 'prettier'
import type { Document } from '#app/types/document.js'
import baseSchema from '#documents/schema.graphql?raw'
import expand from './index.js'
import initialSchema from './fixtures/initial.graphql?raw'
import expandedSchema from './fixtures/expanded.graphql?raw'
import { invoke } from '#app/utils/invoke.js'

test('expand directive @create', async () => {
  expansionTestBench({
    expand,
    initialSchema,
    expandedSchema,
  })
})

async function expansionTestBench({
  expand,
  initialSchema,
  expandedSchema,
}: {
  expand: (document: Document) => void
  initialSchema: string
  expandedSchema: string
}) {
  const initialAST = parse(initialSchema)

  buildASTSchema(initialAST)
  buildASTSchema(parse(baseSchema + expandedSchema))

  const document: Document = {
    bundles: initialAST.definitions.map((node) => ({
      node,
      expansions: [],
    })),
    globals: [],
  }

  expand(document)

  const result = await invoke(async () => {
    let x

    x = [
      print({
        kind: Kind.DOCUMENT,
        definitions: document.bundles.flatMap((bundle) => {
          return [bundle.node, ...bundle.expansions]
        }),
      }),
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

    x = await prettier.format(x, { parser: 'graphql' })

    return x
  })

  expect(result).toBe(expandedSchema)
}
