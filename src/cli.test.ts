import { expect, test } from 'vitest'
import expandedSchema from './transformers/directives/create/fixtures/expanded.graphql?raw'
import { exec as _exec } from 'child_process'
import { promisify } from 'util'
import { readFile, unlink } from 'fs/promises'
import './cli.js?raw'
import './transformers/directives/create/fixtures/initial.graphql?raw'

const exec = promisify(_exec)

const schemaPath =
  './src/transformers/directives/create/fixtures/initial.graphql'
const outputPath = './dist/schema.graphql'

test('cli', async () => {
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
