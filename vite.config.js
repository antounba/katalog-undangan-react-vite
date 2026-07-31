import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Baris ini yang menyebabkan error jika belum di-install

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0', // Agar bisa diakses dari HP
    port: 5173,
  }
})

