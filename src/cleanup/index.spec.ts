import { buildSchema } from 'graphql'
import cleanup from './index.js'
import type { Document } from '#app/document.js'
import expandedSchema from './fixtures/expanded.gql?raw'
import { expect } from 'vitest'
import { invoke } from '#app/utils/invoke.js'
import { Kind } from 'graphql'
import { parse } from 'graphql'
import * as prettier from 'prettier'
import { print } from 'graphql'
import { test } from 'vitest'

test('expand directive @create', async () => {
  buildSchema(expandedSchema)

  const initialSchemas = await Promise.all([
    import('./fixtures/initial-1.gql?raw'),
    import('./fixtures/initial-2.gql?raw'),
  ]).then((modules) => modules.map((module) => module.default))

  for (const initialSchema of initialSchemas) {
    const initialAST = parse(initialSchema)

    const document: Document = {
      bundles: initialAST.definitions.map((node) => ({
        node,
        expansions: [],
      })),
      globals: [],
    }

    const result = await invoke(async () => {
      let x

      x = cleanup({
        kind: Kind.DOCUMENT,
        definitions: document.bundles.flatMap((bundle) => {
          return [bundle.node, ...bundle.expansions]
        }),
      })

      x = [
        print(x),
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

    expect(result).toBe(expandedSchema)
  }
})
