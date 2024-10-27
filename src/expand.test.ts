import { expect, test } from 'vitest'
import { expand } from './expand.js'
import initialSchema from './fixtures/initial.graphql?raw'
import expandedSchema from './fixtures/expanded.graphql?raw'

test('expand', async () => {
  const result = await expand(initialSchema)

  expect(result).toBe(expandedSchema)
})
