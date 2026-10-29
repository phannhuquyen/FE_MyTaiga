import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/live',
  outputDir: 'test-results/live',
  timeout: 90000,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'test-results/live-browser-results.json' }]],
  use: { baseURL: 'http://localhost:5173', browserName: 'chromium', trace: 'off', screenshot: 'off', video: 'off' },
})
