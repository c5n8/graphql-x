import { exec as _exec } from 'node:child_process'
import { expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { importDefaults } from '#package/testing/import-defaults.js'
import { invoke } from '@txe/invoke'
import { onTestFinished } from 'vitest'
import path from 'node:path'
import * as prettier from 'prettier'
import { promisify } from 'node:util'
import { readFile } from 'node:fs/promises'
import { rm } from 'node:fs/promises'
import { test } from 'vitest'

const exec = promisify(_exec)

test('cli', async () => {
  import('../fixtures/initial.gql?raw')

  const schema = await importDefaults({
    expanded: () => import('../fixtures/expanded.gql?raw'),
  })

  onTestFinished(async () => {
    await rm(outputDirectory, { recursive: true, force: true })
  })

  const filename = fileURLToPath(import.meta.url)
  const dirname = path.dirname(filename)
  const schemaPath = path.join(dirname, '../fixtures/initial.gql')
  const outputPath = path.join(dirname, '../fixtures/.generated/schema.gql')
  const outputDirectory = path.dirname(outputPath)

  await rm(outputDirectory, { recursive: true, force: true })
  await exec(`bin/graphql-x --schema ${schemaPath} --output ${outputPath}`)

  const result = await invoke(async () => {
    let x

    x = await readFile(outputPath, { encoding: 'utf-8' })
    x = await prettier.format(x, { parser: 'graphql' })

    return x
  })

  expect(result).toBe(schema.expanded)
})
