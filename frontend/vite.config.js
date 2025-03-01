import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    host: true, // Allows external devices to connect
    strictPort: true,
    port: 5173, // Ensure it's not conflicting
    hmr: false,
  },
})
