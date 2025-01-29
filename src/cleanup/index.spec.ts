import { buildSchema } from 'graphql'
import cleanup from './index.js'
import { createBundle } from '#package/document.js'
import { createDocument } from '#package/document.js'
import type { Document } from '#package/document.js'
import expandedSchema from './fixtures/expanded.gql?raw'
import { expect } from 'vitest'
import { invoke } from '@txe/invoke'
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

  const results = await Promise.all(
    initialSchemas.map(async (initialSchema) => {
      const initialAST = parse(initialSchema)
      const document: Document = createDocument({
        bundles: initialAST.definitions.map((node) => createBundle({ node })),
      })

      const result = await invoke(async () => {
        let x

        x = cleanup({
          kind: Kind.DOCUMENT,
          definitions: document.bundles.flatMap((bundle) => [bundle.node]),
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

      return result
    }),
  )

  expect(results[0]).toBe(expandedSchema)
  expect(results[1]).toBe(expandedSchema)
})
