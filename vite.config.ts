import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5141',
        changeOrigin: true,
        secure: false,
      },
      '/hubs': {
        target: 'http://localhost:5141',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
})
