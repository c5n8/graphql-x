export async function importDefaults<
  T extends Record<string, () => Promise<{ default: unknown }>>,
>(
  importMap: T,
): Promise<{
  [P in keyof T]: Awaited<ReturnType<T[P]>>['default']
}> {
  let x

  x = Object.entries(importMap)
  x = x.map(async ([key, value]) => {
    const { default: module } = await value()

    return [key, module]
  })
  x = await Promise.all(x)
  x = Object.fromEntries(x)

  return x
}
