export function traillead<F extends (...args: never[]) => Promise<void>>(
  fn: F,
): (...args: Parameters<F>) => Promise<void> {
  let current: Promise<void> | undefined
  let next: (() => Promise<void>) | undefined

  return async function _fn(...args) {
    if (current !== undefined) {
      next = async () => {
        next = undefined
        await _fn(...args)
      }

      return
    }

    current = fn(...args)
    await current
    // eslint-disable-next-line require-atomic-updates
    current = undefined
    await next?.()
  }
}
