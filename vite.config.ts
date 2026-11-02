import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/pages/**'],
      exclude: ['**/*.test.{ts,tsx}'],
      thresholds: { lines: 80 },
    },
  },
})
