/// <reference types="vitest/globals" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'import.meta.env.VITE_USE_MOCKS': JSON.stringify('true'),
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('http://localhost:8080/api'),
  },
})
