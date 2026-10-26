import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

// Site identity (spec-v4-deploy-infra D10/D12): index.html carries %SITE_URL% /
// %SITE_NAME% tokens and this plugin fills them at build time from the
// environment — CI variables in production, the local .env in development. A
// production build without them fails loudly, like content validation.
function siteIdentity(): Plugin {
  let siteUrl = ''
  let siteName = ''
  return {
    name: 'site-identity',
    configResolved(config) {
      const loaded = loadEnv(config.mode, config.root, '')
      siteUrl = process.env.SITE_URL || loaded.SITE_URL || ''
      siteName = process.env.SITE_NAME || loaded.SITE_NAME || ''
      if (config.command === 'build' && (!siteUrl || !siteName)) {
        throw new Error(
          'SITE_URL / SITE_NAME are not set — the production build needs the site identity. ' +
            'Provide them as CI repository variables (GitHub Actions) or in the local .env; see .env.example.',
        )
      }
      // Dev fallbacks keep `pnpm dev` bootable with no environment at all.
      if (!siteUrl) siteUrl = 'http://localhost:5173'
      if (!siteName) siteName = 'Portfolio (dev)'
    },
    transformIndexHtml(html) {
      return html.replaceAll('%SITE_URL%', siteUrl).replaceAll('%SITE_NAME%', siteName)
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const contentsApiUrl = env.CONTENT_API_BASE || process.env.CONTENT_API_BASE || ''
  // Dev parity with the production nginx `/api/content/` proxy (spec-v4 §6.2,
  // spec-v6 D4): both read the same CONTENT_API_BASE value and send the same
  // Authorization form. Without it there is no proxy — edit mode falls back to
  // the offline state, exactly like a missing token.
  const contentsApi = contentsApiUrl ? new URL(contentsApiUrl) : null
  return {
    plugins: [react(), siteIdentity()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: {
      proxy: contentsApi
        ? {
            '/api/content/': {
              target: contentsApi.origin,
              changeOrigin: true,
              rewrite: (p) => p.replace(/^\/api\/content\//, contentsApi.pathname),
              configure: (proxy) => {
                proxy.on('proxyReq', (proxyReq) => {
                  const token = env.CONTENT_API_TOKEN || process.env.CONTENT_API_TOKEN
                  // Bearer, not the legacy "token" prefix: the dev proxy must send
                  // exactly what the production nginx proxy sends (spec-v6 D4).
                  if (token) proxyReq.setHeader('Authorization', `Bearer ${token}`)
                })
              },
            },
          }
        : undefined,
    },
  }
})
