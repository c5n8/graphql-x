import expand from './index.js'
import expandedSchema from './fixtures/expanded.gql?raw'
import initialSchema from './fixtures/initial.gql?raw'
import { test } from 'vitest'
import { testExpansion } from '#package/testing/utils/test-expansion.js'

test('expand directive @create', async () => {
  testExpansion({ expand, initialSchema, expandedSchema })
})
