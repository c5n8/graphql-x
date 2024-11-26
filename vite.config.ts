/// <reference types="vitest/config" />

import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    /* for example, use global to avoid globals imports (describe, test, expect): */
    // globals: true,
    coverage: {
      include: ['src/*'],
    },
  },
  resolve: {
    alias: {
      '#app': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
