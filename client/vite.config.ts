import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const target = process.env.PROXY_TARGET || 'http://localhost:8080'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
      include: ['pdfmake/build/pdfmake', 'pdfmake/build/vfs_fonts'],
  },
  server: {
    host: true,
    proxy: {
      "/api": {
        target,
        changeOrigin: true,
      },
    },
  },
});
