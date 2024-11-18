export function define<T = never>(value: NoInfer<T>): T {
  return value
}
