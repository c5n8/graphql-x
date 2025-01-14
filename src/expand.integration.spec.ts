import { buildSchema } from 'graphql'
import { expand } from './expand.js'
import { expect } from 'vitest'
import { importDefaults } from './testing/import-defaults.js'
import { invoke } from '@txe/invoke'
import * as prettier from 'prettier'
import { test } from 'vitest'

test('expand', async () => {
  const schema = await importDefaults({
    initial: () => import('./fixtures/initial.gql?raw'),
    expanded: () => import('./fixtures/expanded.gql?raw'),
  })

  expect(() => buildSchema(schema.initial)).not.toThrow()
  expect(() => buildSchema(schema.expanded)).not.toThrow()

  const result = await invoke(async () => {
    let x

    x = await expand(schema.initial)
    x = await prettier.format(x, { parser: 'graphql' })

    return x
  })

  expect(result).toBe(schema.expanded)
})
