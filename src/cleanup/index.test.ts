import { expect, test } from 'vitest'
import { buildASTSchema, Kind, parse, print } from 'graphql'
import * as prettier from 'prettier'
import type { Document } from '#app/types/document.js'
import cleanup from './index.js'
import expandedSchema from './fixtures/expanded.graphql?raw'
import { invoke } from '#app/utils/invoke.js'

test('expand directive @create', async () => {
  const initialSchemas = await Promise.all([
    import('./fixtures/initial-1.graphql?raw'),
    import('./fixtures/initial-2.graphql?raw'),
  ]).then((modules) => modules.map((module) => module.default))

  for (const initialSchema of initialSchemas) {
    const initialAST = parse(initialSchema)
    buildASTSchema(parse(expandedSchema))

    const document: Document = {
      bundles: initialAST.definitions.map((node) => ({
        node,
        expansions: [],
      })),
      globals: [],
    }

    const cleaned = cleanup({
      kind: Kind.DOCUMENT,
      definitions: document.bundles.flatMap((bundle) => {
        return [bundle.node, ...bundle.expansions]
      }),
    })

    const result = await invoke(async () => {
      let x

      x = [
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

      x = await prettier.format(x, { parser: 'graphql' })

      return x
    })

    expect(result).toBe(expandedSchema)
  }
})
