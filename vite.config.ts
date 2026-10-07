import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// GH Pages serves project sites under /<repo>/, so a relative base
// keeps built asset URLs correct regardless of where the repo ends up.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
})
