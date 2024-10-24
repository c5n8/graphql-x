// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function invoke<F extends (...args: any[]) => any>(
  fn: F,
): ReturnType<F> {
  return fn()
}
