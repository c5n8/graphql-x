import { expect, test } from 'vitest'
import { Kind, parse, print } from 'graphql'
import type { Bundle, Document } from '#app/document.js'
import expand from './index.js'
import initial from './fixture/initial.graphql?raw'
import expanded from './fixture/expanded.graphql?raw'

test('expand directive @create', async () => {
  expansionTestBench({ expand, initial, expanded })
})

function expansionTestBench({
  expand,
  initial,
  expanded,
}: {
  expand: (node: Bundle, document: Document) => void
  initial: string
  expanded: string
}) {
  expect(() => parse(initial)).not.toThrowError()
  expect(() => parse(expanded)).not.toThrowError()

  const document: Document = {
    bundles: parse(initial).definitions.map((node) => ({
      node,
      expansions: [],
    })),
    globals: [],
  }

  for (const bundle of document.bundles) {
    expand(bundle, document)
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
    Object.keys(
      document.globals.reduce(
        (accumulator, definition) => {
          const printed = print({
            kind: Kind.DOCUMENT,
            definitions: [definition],
          })

          accumulator[printed] = Symbol()

          return accumulator
        },
        {} as Record<string, symbol>,
      ),
    ).join('\n\n') +
    '\n'

  expect(result).toBe(expanded)
}
