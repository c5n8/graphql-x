export function invoke<F extends (...args: never[]) => unknown>(
  fn: F,
): ReturnType<F> {
  return fn() as ReturnType<F>
}
