import { expect, test } from 'vitest'
import { expand } from './expand.js'
import initialSchema from './transformers/directives/create/fixtures/initial.graphql?raw'
import expandedSchema from './transformers/directives/create/fixtures/expanded.graphql?raw'

test('expand', async () => {
  const result = await expand(initialSchema)

  expect(result).toBe(expandedSchema)
})
