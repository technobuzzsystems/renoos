import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { handleApiRequest } from './server/apiHandler.ts'

function renoosApiPlugin(): Plugin {
  return {
    name: 'renoos-api-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const handled = await handleApiRequest(req, res)
          if (!handled) {
            next()
          }
        } catch (err) {
          next(err)
        }
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const handled = await handleApiRequest(req, res)
          if (!handled) {
            next()
          }
        } catch (err) {
          next(err)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), renoosApiPlugin()],
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
