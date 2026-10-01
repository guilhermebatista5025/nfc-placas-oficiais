import { createServer } from 'node:http'
import { env } from './config/env.js'

const startedAt = Date.now()

function sendJson(response, status, body, origin) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Access-Control-Allow-Origin': origin,
    Vary: 'Origin',
  })
  response.end(JSON.stringify(body))
}

const server = createServer((request, response) => {
  const requestOrigin = request.headers.origin
  const allowedOrigin = requestOrigin === env.frontendUrl ? requestOrigin : env.frontendUrl
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`)

  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    })
    return response.end()
  }

  if (request.method === 'GET' && url.pathname === '/api/health') {
    return sendJson(response, 200, {
      ok: true,
      service: 'craft-nfc-backend',
      supabaseConfigured: env.supabaseConfigured,
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    }, allowedOrigin)
  }

  if (request.method === 'GET' && url.pathname === '/') {
    return sendJson(response, 200, {
      ok: true,
      service: 'craft-nfc-backend',
      message: 'Backend online. Abra a interface no endereço informado em frontendUrl.',
      frontendUrl: env.frontendUrl,
      healthUrl: '/api/health',
    }, allowedOrigin)
  }

  return sendJson(response, 404, { error: 'Rota não encontrada.' }, allowedOrigin)
})

server.listen(env.port, '127.0.0.1', () => {
  console.log(`Craft NFC backend disponível em http://127.0.0.1:${env.port}`)
})

function shutdown() {
  server.close(() => process.exit(0))
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
