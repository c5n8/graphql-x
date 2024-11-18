export function cmdErrorHandling(
  option: { watch: boolean },
  fn: () => Promise<void>,
) {
  const { watch = false } = option

  return async () => {
    try {
      await fn()
    } catch (error) {
      console.error(error)

      if (watch) {
        console.log('Watching for changes...')
      }

      return
    }

    if (watch) {
      console.log('Watching for changes...')
    }
  }
}
