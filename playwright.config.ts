import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: 'test-results/mock',
  timeout: 20000,
  workers: 2,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'test-results/browser-results.json' }]],
  use: { baseURL: 'http://localhost:5173', browserName: 'chromium', trace: 'off', screenshot: 'off', video: 'off' },
})
