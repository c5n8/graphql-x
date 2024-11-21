export function traillead<F extends (...args: never[]) => Promise<void>>(
  fn: F,
): (...args: Parameters<F>) => Promise<void> {
  let current: Promise<void> | null
  let next: (() => Promise<void>) | null

  return async function _fn(...args) {
    if (current != null) {
      next = async () => {
        next = null
        await _fn(...args)
      }

      return
    }

    current = fn(...args)
    await current
    current = null
    await next?.()
  }
}
