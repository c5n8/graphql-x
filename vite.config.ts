/// <reference types="vitest/config" />

import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    /* for example, use global to avoid globals imports (describe, test, expect): */
    // globals: true,
  },
  resolve: {
    alias: {
      '#app': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
