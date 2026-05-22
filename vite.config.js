import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const buildId = process.env.COMMIT_REF || process.env.GITHUB_SHA || `local-${Date.now()}`
const buildTime = new Date().toISOString()

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_BUILD_ID__: JSON.stringify(buildId),
    __APP_BUILD_TIME__: JSON.stringify(buildTime),
  },
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
    target: 'es2019',
    cssTarget: 'chrome88',
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
