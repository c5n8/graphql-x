import { expand } from './expand.js'
import expandedSchema from './fixtures/expanded.graphql?raw'
import { expect } from 'vitest'
import initialSchema from './fixtures/initial.graphql?raw'
import { test } from 'vitest'

test('expand', async () => {
  const result = await expand(initialSchema)

  expect(result).toBe(expandedSchema)
})
