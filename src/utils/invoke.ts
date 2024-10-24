export function invoke<F extends () => unknown>(fn: F): ReturnType<F> {
  return fn() as ReturnType<F>
}
