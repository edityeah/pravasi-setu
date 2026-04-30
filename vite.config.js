import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Lightweight dev-time middleware that runs the same /api/*.js handlers we
// ship to Vercel. Lets `npm run dev` exercise the realtime-session endpoint
// without needing `vercel dev`. In production Vercel handles /api/* natively.
function vercelApiDevMiddleware() {
  return {
    name: 'vercel-api-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) return next()

        // Strip query string + trailing slash, then resolve to the matching
        // file under ./api. Refuse traversal attempts.
        const pathname = req.url.split('?')[0].replace(/\/+$/, '')
        const safePath = pathname.replace(/^\/api\//, '').replace(/[^a-zA-Z0-9_\-./]/g, '')
        if (!safePath || safePath.includes('..')) {
          res.statusCode = 404
          return res.end('Not found')
        }

        try {
          const mod = await server.ssrLoadModule(`/api/${safePath}.js`)
          const handler = mod.default
          if (typeof handler !== 'function') {
            res.statusCode = 500
            return res.end('Handler missing default export')
          }

          // Adapt Node http req/res to a minimal Vercel-flavoured shape:
          // body parsing for JSON + helper res methods (status / json / setHeader).
          let body = ''
          if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            body = await new Promise((resolve, reject) => {
              const chunks = []
              req.on('data', c => chunks.push(c))
              req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
              req.on('error', reject)
            })
          }

          const adaptedReq = Object.assign(req, {
            body: body && req.headers['content-type']?.includes('application/json')
              ? safeParseJson(body)
              : body,
            query: parseQuery(req.url),
          })

          const adaptedRes = Object.assign(res, {
            status(code) { res.statusCode = code; return this },
            json(payload) {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(payload))
              return this
            },
          })

          await handler(adaptedReq, adaptedRes)
        } catch (e) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'dev_handler_threw', message: String(e?.message || e) }))
        }
      })
    },
  }
}

function safeParseJson(s) { try { return JSON.parse(s) } catch { return s } }
function parseQuery(url) {
  const i = url.indexOf('?')
  if (i < 0) return {}
  const out = {}
  for (const pair of url.slice(i + 1).split('&')) {
    if (!pair) continue
    const [k, v = ''] = pair.split('=')
    out[decodeURIComponent(k)] = decodeURIComponent(v)
  }
  return out
}

export default defineConfig(({ mode }) => {
  // Surface .env / .env.local to the dev middleware (process.env is the
  // contract the Vercel handler reads from).
  const env = loadEnv(mode, process.cwd(), '')
  for (const [k, v] of Object.entries(env)) {
    if (process.env[k] === undefined) process.env[k] = v
  }
  return {
    plugins: [react(), vercelApiDevMiddleware()],
  }
})
