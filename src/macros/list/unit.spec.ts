import { buildSchema } from 'graphql'
import { execExpansion } from '#package/testing/exec-expansion.js'
import expand from './index.js'
import { expect } from 'vitest'
import { importDefaults } from '#package/testing/import-defaults.js'
import { test } from 'vitest'

test('@list and @relatedList', async () => {
  const schema = await importDefaults({
    base: () => import('#package/fixtures/base.gql?raw'),
    initial: () => import('./fixtures/initial.gql?raw'),
    expanded: () => import('./fixtures/expanded.gql?raw'),
  })

  expect(() => buildSchema(schema.initial)).not.toThrow()
  expect(() => buildSchema(schema.base + schema.expanded)).not.toThrow()

  const result = await execExpansion({ expand, schema: schema.initial })

  expect(result).toBe(schema.expanded)
})

test('@list edge cases', async () => {
  const schema = await importDefaults({
    base: () => import('#package/fixtures/base.gql?raw'),
    initial: () => import('./fixtures/edge/list/initial.gql?raw'),
    expanded: () => import('./fixtures/edge/list/expanded.gql?raw'),
  })

  expect(() => buildSchema(schema.initial)).not.toThrow()
  expect(() => buildSchema(schema.base + schema.expanded)).not.toThrow()

  const result = await execExpansion({ expand, schema: schema.initial })

  expect(result).toBe(schema.expanded)
})

test('@relatedList edge cases', async () => {
  const schema = await importDefaults({
    base: () => import('#package/fixtures/base.gql?raw'),
    initial: () => import('./fixtures/edge/related-list/initial.gql?raw'),
    expanded: () => import('./fixtures/edge/related-list/expanded.gql?raw'),
  })

  expect(() => buildSchema(schema.initial)).not.toThrow()
  expect(() => buildSchema(schema.base + schema.expanded)).not.toThrow()

  const result = await execExpansion({ expand, schema: schema.initial })

  expect(result).toBe(schema.expanded)
})
