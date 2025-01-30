import { buildSchema } from 'graphql'
import { execExpansion } from '#package/testing/exec-expansion.js'
import expand from './index.js'
import { expect } from 'vitest'
import { importDefaults } from '#package/testing/import-defaults.js'
import { test } from 'vitest'

test('expand directive @item', async () => {
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

test('@item error case 1', async () => {
  const schema = await importDefaults({
    initial: () => import('./fixtures/errors/x1.gql?raw'),
  })

  expect(() => buildSchema(schema.initial)).not.toThrow()

  // oxlint-disable-next-line eslint-plugin-jest(no-conditional-expect)
  await expect(
    execExpansion({ expand, schema: schema.initial }),
  ).rejects.toThrow(
    'Type with directive "@item" should have exactly one field of type ID.',
  )
})

test('@item error case 2', async () => {
  const schema = await importDefaults({
    initial: () => import('./fixtures/errors/x2.gql?raw'),
  })

  expect(() => buildSchema(schema.initial)).not.toThrow()

  // oxlint-disable-next-line eslint-plugin-jest(no-conditional-expect)
  await expect(
    execExpansion({ expand, schema: schema.initial }),
  ).rejects.toThrow(
    'Type with directive "@item" should have exactly one field of type ID.',
  )
})
