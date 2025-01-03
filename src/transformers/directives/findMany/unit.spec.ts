import { buildSchema } from 'graphql'
import { execExpansion } from '#package/testing/utils/exec-expansion.js'
import expand from './index.js'
import { expect } from 'vitest'
import { importDefaults } from '#package/testing/utils/import-defaults.js'
import { test } from 'vitest'

test('expand directive @create', async () => {
  const schema = await importDefaults({
    base: () => import('#package/fixtures/base.gql?raw'),
    initial: () => import('./fixtures/initial.gql?raw'),
    expanded: () => import('./fixtures/expanded.gql?raw'),
    globals: () => import('./globals.gql?raw'),
  })

  expect(() => buildSchema(schema.initial)).not.toThrow()
  expect(() =>
    buildSchema(schema.base + schema.expanded + schema.globals),
  ).not.toThrow()

  const result = await execExpansion({ expand, schema: schema.initial })

  expect(result).toBe(schema.expanded)
})
