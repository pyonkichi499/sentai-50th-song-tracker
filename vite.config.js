import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }
          if (id.includes('/firebase/')) {
            return 'vendor-firebase'
          }
          if (id.includes('/fuse.js/')) {
            return 'vendor-fuse'
          }
          if (id.includes('/react/') || id.includes('/react-dom/')) {
            return 'vendor-react'
          }
          return 'vendor'
        },
      },
    },
  },
})
