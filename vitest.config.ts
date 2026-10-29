import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { alias: { '@': `${import.meta.dirname}/src` } },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/setup.ts'],
    restoreMocks: true,
  },
})
