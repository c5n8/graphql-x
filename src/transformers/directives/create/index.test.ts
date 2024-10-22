import { expect, test } from 'vitest'
import { Kind, parse, print } from 'graphql'
import type { Bundle, Document } from '#app/document.js'
import expand from './index.js'
import initial from './fixture/initial.graphql?raw'
import expansion from './fixture/expansion.graphql?raw'

test('expand directive @create', async () => {
  expansionTestBench({ expand, initial, expansion })
})

function expansionTestBench({
  expand,
  initial,
  expansion,
}: {
  expand: (node: Bundle, document: Document) => Bundle
  initial: string
  expansion: string
}) {
  expect(() => parse(initial)).not.toThrowError()
  expect(() => parse(expansion)).not.toThrowError()

  const document: Document = {
    bundles: parse(initial).definitions.map((node) => ({
      node,
      expansions: [],
    })),
  }

  const [bundle] = document.bundles

  if (bundle == null) {
    throw new Error('invalid document')
  }

  const { expansions } = expand(bundle, document)

  const result =
    print({
      kind: Kind.DOCUMENT,
      definitions: expansions,
    }) + '\n'

  expect(result).toBe(expansion)
}
