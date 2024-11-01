import { expect, test } from 'vitest'
import { traillead } from '#app/utils/traillead.js'

test('traillead', async () => {
  let store = 0

  const save = traillead(async (n: number) => {
    await new Promise<void>((resolve) => setTimeout(resolve, 0))

    store = n
  })

  await Promise.all([
    save(1).then(() => expect(store).toBe(3)),
    save(2).then(() => expect(store).toBe(0)),
    save(3).then(() => expect(store).toBe(0)),
  ])
})
