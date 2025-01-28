import { expand } from './index.js'
import { expect } from 'vitest'
import * as index from './index.js'
import { test } from 'vitest'

test('index', () => {
  expect(index.expand).equals(expand)
})
