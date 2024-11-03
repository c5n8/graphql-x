export function invoke<F extends (...args: never[]) => ReturnType<F>>(fn: F) {
  return fn()
}
