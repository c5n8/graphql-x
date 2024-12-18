import { expect } from 'vitest'
import { test } from 'vitest'
import { traillead } from '#package/utils/traillead.js'

test('traillead', async () => {
  // oxlint-disable promise/prefer-await-to-then
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  const deferred = Promise.withResolvers<void>()
  // oxlint-enable promise/prefer-await-to-then
  let store = 0

  const save = traillead(async (n: number) => {
    await deferred.promise
    store = n
  })

  const promise = save(1)
  await save(2)

  expect(store).toBe(0)

  deferred.resolve()
  await promise

  expect(store).toBe(2)
})
