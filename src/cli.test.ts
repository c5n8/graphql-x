import { expect, test } from 'vitest'
import { exec as _exec } from 'child_process'
import { promisify } from 'util'
import { readFile, unlink } from 'fs/promises'
import './cli.js?raw'
import './fixtures/initial.graphql?raw'
import expandedSchema from './fixtures/expanded.graphql?raw'
import path from 'path'
import { fileURLToPath } from 'url'

const exec = promisify(_exec)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const schemaPath = path.join(__dirname, './fixtures/initial.graphql')
const outputPath = './dist/schema.graphql'

test('cli', async () => {
  await exec('npm run build')
  await exec(
    [
      'node',
      '--enable-source-maps',
      'dist/cli.js',
      `--schema ${schemaPath}`,
      `--output ${outputPath}`,
    ].join(' '),
  )

  const result = await readFile('./dist/schema.graphql', { encoding: 'utf-8' })

  expect(result).toBe(expandedSchema)

  await unlink('./dist/schema.graphql')
})
