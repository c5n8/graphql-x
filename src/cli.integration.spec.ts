import './cli.js'
import './fixtures/initial.graphql?raw'
import { exec as _exec } from 'node:child_process'
import expandedSchema from './fixtures/expanded.graphql?raw'
import { expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { invoke } from '#app/utils/invoke.js'
import path from 'node:path'
import * as prettier from 'prettier'
import { promisify } from 'node:util'
import { readFile } from 'node:fs/promises'
import { rm } from 'node:fs/promises'
import { test } from 'vitest'

const exec = promisify(_exec)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const schemaPath = path.join(__dirname, './fixtures/initial.graphql')
const outputPath = path.join(__dirname, './fixtures/.generated/schema.graphql')
const outputDir = path.dirname(outputPath)

test('cli', async () => {
  await rm(outputDir, { recursive: true, force: true })
  await exec(`bin/graphql-x --schema ${schemaPath} --output ${outputPath}`)

  const result = await invoke(async () => {
    let x

    x = await readFile(outputPath, { encoding: 'utf-8' })
    x = await prettier.format(x, { parser: 'graphql' })

    return x
  })

  expect(result).toBe(expandedSchema)
})
