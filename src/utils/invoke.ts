export function invoke<T>(fn: (...args: never[]) => T): T {
  return fn()
}
