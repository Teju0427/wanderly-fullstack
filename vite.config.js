import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // `npm run dev:server` runs the Express API on :8080
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
