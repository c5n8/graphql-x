import { expand } from './expand.js'
import expandedSchema from './fixtures/expanded.graphql?raw'
import { expect } from 'vitest'
import initialSchema from './fixtures/initial.graphql?raw'
import { invoke } from '#app/utils/invoke.js'
import prettier from 'prettier'
import { test } from 'vitest'

test('expand', async () => {
  const result = await invoke(async () => {
    let x

    x = await expand(initialSchema)
    x = await prettier.format(x, { parser: 'graphql' })

    return x
  })

  expect(result).toBe(expandedSchema)
})
