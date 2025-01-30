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

test('@list error case 1', async () => {
  const schema = await importDefaults({
    initial: () => import('./fixtures/errors/x1.gql?raw'),
  })

  expect(() => buildSchema(schema.initial)).not.toThrow()

  // oxlint-disable-next-line eslint-plugin-jest(no-conditional-expect)
  await expect(
    execExpansion({ expand, schema: schema.initial }),
  ).rejects.toThrow('Directive "@list" argument "field" must be non-empty.')
})

test('@list error case 2', async () => {
  const schema = await importDefaults({
    initial: () => import('./fixtures/errors/x2.gql?raw'),
  })

  expect(() => buildSchema(schema.initial)).not.toThrow()

  // oxlint-disable-next-line eslint-plugin-jest(no-conditional-expect)
  await expect(
    execExpansion({ expand, schema: schema.initial }),
  ).rejects.toThrow(
    'Directive "@list" argument "field" must be of type "String".',
  )
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
