import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Disable Fast Refresh for context files to avoid errors
      exclude: /node_modules/,
    }),
    tailwindcss(),
  ],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'prop-types'],
  },
})
