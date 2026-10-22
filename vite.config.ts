import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    // Mirror the production nginx `/api/content/` proxy (spec-v4 §6.2) so edit
    // mode works against the real repository during development. Start with
    // `GITEA_TOKEN=... pnpm dev`; without the token the proxy answers 404 and
    // edit mode falls back to the offline state.
    proxy: {
      '/api/content/': {
        target: 'http://192.168.10.8:3080',
        changeOrigin: true,
        rewrite: (p) => {
         return p.replace(/^\/api\/content\//, '/api/v1/repos/dong.nguyen/cv/contents/');
        },
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            const token = process.env.GITEA_TOKEN
            if (token) proxyReq.setHeader('Authorization', `token ${token}`)
          })
        },
      },
    },
  },
})
