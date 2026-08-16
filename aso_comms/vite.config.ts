// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <<< This import is crucial

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <<< The plugin must be added to the array
  ],
})