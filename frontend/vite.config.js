import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Important: Allows access from browser
    port: 5173,
    watch: {
      usePolling: true // Important: Fixes auto-refresh on Android
    }
  }
})