import EventEmitter from 'events'

export function createTrailingLeaderOperation<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  F extends (...args: any[]) => Promise<any>,
>(fn: F): F {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: Promise<any> | null
  let next: (() => void) | null

  const event = new EventEmitter()

  event.on('finish', () => {
    current = null

    if (next != null) {
      next()
      next = null
    }
  })

  const operate = (async (...args: unknown[]) => {
    if (current != null) {
      console.log('queued', ...args)
      next = () => operate(...args)

      return
    }

    current = fn(...args)
    const result = await current

    event.emit('finish')

    return result
  }) as F

  return operate
}
