import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        // Split the two heavy vendors out of the app chunk: the DiceBear style
        // definition and motion are both large and change rarely, so they
        // cache separately and the app chunk stays small.
        advancedChunks: {
          groups: [
            { name: 'dicebear', test: /[\/]node_modules[\/]@dicebear[\/]/ },
            { name: 'motion', test: /[\/]node_modules[\/](motion|framer-motion)[\/]/ },
            { name: 'react', test: /[\/]node_modules[\/](react|react-dom|react-router|scheduler)[\/]/ },
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@content': fileURLToPath(new URL('./content', import.meta.url)),
    },
  },
})
