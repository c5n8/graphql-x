import { debounce } from 'lodash-es'
import { expand } from '#app/expand.js'
import { mkdir } from 'node:fs/promises'
import { parseArgs } from 'node:util'
import * as path from 'node:path'
import { readFile } from 'node:fs/promises'
import { subscribe } from '@parcel/watcher'
import { traillead } from '#app/utils/traillead.js'
import { writeFile } from 'node:fs/promises'

const args = parseArgs({
  options: {
    schema: { type: 'string' },
    output: { type: 'string' },
    watch: { type: 'boolean' },
  },
  strict: true,
})

const {
  schema: schemaPath = '',
  output: outputPath = '',
  watch = false,
} = args.values

await readFile(schemaPath)
await mkdir(path.dirname(outputPath), { recursive: true })

const delay = { quantity: 128, unit: 'millisecond' }

const callback = debounce(
  traillead(async () => {
    try {
      console.log('Expanding...')
      await main()
    } catch (error) {
      console.error(error)

      if (watch) {
        console.log('Watching for changes...')
      }

      return
    }

    if (watch) {
      console.log('Schema expanded. Watching for changes...')
    }
  }),
  delay.quantity,
)

callback()

if (watch) {
  await subscribe(
    path.join(process.cwd(), path.dirname(schemaPath)),
    async (_, events) => {
      for (const event of events) {
        if (path.relative(event.path, schemaPath) === '') {
          callback()

          return
        }
      }
    },
  )
}

async function main() {
  const initial = await readFile(schemaPath, { encoding: 'utf-8' })
  const expanded = await expand(initial)

  await writeFile(outputPath, expanded, { encoding: 'utf-8' })
}
