import { expect } from 'vitest'
import { test } from 'vitest'
import { traillead } from '#package/utils/traillead.js'

test('traillead', async () => {
  // oxlint-disable promise/prefer-await-to-then
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  const deferred = Promise.withResolvers<void>()
  // oxlint-enable promise/prefer-await-to-then
  let message

  const save = traillead(async (text: string) => {
    await deferred.promise
    message = text
  })

  const promise = save('hi')
  await save('hello')

  expect(message).toBeUndefined()

  deferred.resolve()
  await promise

  expect(message).toBe('hello')
})
