import { expect, test } from 'vitest'
import { expand } from './expand.js'

test('expand', () => {
  expect(expand()).toBe(undefined)
})
