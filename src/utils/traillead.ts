import EventEmitter from 'events'

export function traillead<F extends (...args: never[]) => Promise<void>>(
  fn: F,
): F {
  let current: Promise<void> | null
  let next: (() => Promise<void>) | null
  const event = new EventEmitter()

  event.on('next', () => {
    next?.()
  })

  return async function operate(...args) {
    if (current != null) {
      next = async () => {
        next = null
        await operate(...args)
      }

      return
    }

    current = fn(...args)
    await current
    current = null
    event.emit('next')
  } as F
}
