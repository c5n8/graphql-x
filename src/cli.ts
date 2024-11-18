import { cmdErrorHandling } from '#app/utils/cmd-error-handling.js'
import { debounce } from 'lodash-es'
import { expand } from '#app/expand.js'
import { invoke } from '#app/utils/invoke.js'
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

async function main() {
  console.log('Expanding...')

  const initial = await readFile(schemaPath, { encoding: 'utf-8' })
  const expanded = await expand(initial)

  await writeFile(outputPath, expanded, { encoding: 'utf-8' })

  console.log('Schema expanded.')
}

const cmd = invoke(() => {
  let x

  x = main
  x = cmdErrorHandling({ watch }, x)
  x = traillead(x)
  x = debounce(x, 128)

  return x
})

export const cli = async () => {
  await readFile(schemaPath)
  await mkdir(path.dirname(outputPath), { recursive: true })

  cmd()

  if (watch) {
    await subscribe(
      path.join(process.cwd(), path.dirname(schemaPath)),
      async (_, events) => {
        for (const event of events) {
          if (path.relative(event.path, schemaPath) === '') {
            cmd()

            return
          }
        }
      },
    )
  }
}
