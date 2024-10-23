import { expect, test } from 'vitest'
import { expand } from './expand.js'
import initialSchema from './transformers/directives/create/fixtures/initial.graphql?raw'
import expandedSchema from './transformers/directives/create/fixtures/expanded.graphql?raw'

test('expand', async () => {
  expect(await expand(initialSchema)).toBe(expandedSchema)
})
