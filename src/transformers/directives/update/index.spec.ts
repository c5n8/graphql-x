import expand from './index.js'
import expandedSchema from './fixtures/expanded.graphql?raw'
import initialSchema from './fixtures/initial.graphql?raw'
import { test } from 'vitest'
import { testExpansion } from '#app/testing/utils/test-expansion.js'

test('expand directive @create', async () => {
  testExpansion({ expand, initialSchema, expandedSchema })
})
