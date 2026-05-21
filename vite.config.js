import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/winga-api': {
        target: 'https://forex.wingaforex.co.tz',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/winga-api/, ''),
        headers: {
          Origin: 'https://forex.wingaforex.co.tz',
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (['react', 'react-dom'].some((p) => id.includes(`/node_modules/${p}/`))) return 'vendor'
            if (id.includes('/react-router-dom/') || id.includes('/react-router/')) return 'router'
            if (id.includes('/@tanstack/')) return 'query'
            if (id.includes('/framer-motion/')) return 'motion'
            if (id.includes('/apexcharts/') || id.includes('/react-apexcharts/')) return 'charts'
          }
        },
      },
    },
  },
  preview: {
    port: 4173,
  },
})
