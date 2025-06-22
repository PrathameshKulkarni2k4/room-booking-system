import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': 'https://room-booking-system-backend-7exv.onrender.com',
    },
  },
  plugins: [react()],
})

