import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'canvg': fileURLToPath(new URL('./src/lib/emptyStub.ts', import.meta.url)),
    },
    dedupe: ['three', '@react-three/fiber'],
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber'],
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: ['**/node_modules/**', '**/dist/**'],
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('three')) {
            return 'three'
          }
          if (id.includes('@react-three')) {
            return 'r3f'
          }
        },
      },
    },
  },
})
