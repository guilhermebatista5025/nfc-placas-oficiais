import { createServer } from 'node:http'
import { env } from './config/env.js'
import { HttpError, readBody, readJson, sendJson } from './lib/http.js'
import { requireAuth } from './services/auth.js'
import {
  createCheckoutSession,
  createPortalSession,
  createServiceInvoice,
  getBillingSummary,
  processWebhook,
} from './services/billing.js'

const startedAt = Date.now()

function allowedOrigin(request) {
  return request.headers.origin === env.frontendUrl ? request.headers.origin : env.frontendUrl
}

const server = createServer(async (request, response) => {
  const origin = allowedOrigin(request)
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`)

  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type, Idempotency-Key, Stripe-Signature',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    })
    return response.end()
  }

  try {
    if (request.method === 'POST' && url.pathname === '/api/stripe/webhook') {
      const rawBody = await readBody(request)
      const result = await processWebhook(rawBody, request.headers['stripe-signature'] || '')
      return sendJson(response, 200, result, origin)
    }

    if (request.method === 'GET' && url.pathname === '/api/health') {
      return sendJson(response, 200, {
        ok: true,
        service: 'craft-nfc-backend',
        supabaseConfigured: env.supabaseConfigured,
        stripeConfigured: Boolean(env.stripeSecretKey),
        stripeWebhookConfigured: Boolean(env.stripeWebhookSecret),
        automaticTaxEnabled: env.stripeAutomaticTaxEnabled,
        uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
      }, origin)
    }

    if (request.method === 'GET' && url.pathname === '/api/billing/summary') {
      const { profile } = await requireAuth(request)
      return sendJson(response, 200, await getBillingSummary(profile.organization_id), origin)
    }

    if (request.method === 'POST' && url.pathname === '/api/billing/checkout') {
      const { profile } = await requireAuth(request, ['owner', 'admin'])
      const body = await readJson(request)
      const result = await createCheckoutSession(profile.organization_id, body.planKey, request.headers['idempotency-key'])
      return sendJson(response, 201, result, origin)
    }

    if (request.method === 'POST' && url.pathname === '/api/billing/portal') {
      const { profile } = await requireAuth(request, ['owner', 'admin'])
      const body = await readJson(request)
      return sendJson(response, 201, await createPortalSession(profile.organization_id, body.planKey), origin)
    }

    if (request.method === 'POST' && url.pathname === '/api/billing/invoices') {
      const { profile } = await requireAuth(request, ['owner', 'admin'])
      const body = await readJson(request)
      const result = await createServiceInvoice(profile.organization_id, body, request.headers['idempotency-key'])
      return sendJson(response, 201, result, origin)
    }

    if (request.method === 'GET' && url.pathname === '/') {
      return sendJson(response, 200, {
        ok: true,
        service: 'craft-nfc-backend',
        message: 'Backend online.',
        frontendUrl: env.frontendUrl,
        healthUrl: '/api/health',
      }, origin)
    }

    throw new HttpError(404, 'Rota não encontrada.', 'not_found')
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500
    const code = error instanceof HttpError ? error.code : 'internal_error'
    const message = error instanceof HttpError ? error.message : 'Não foi possível concluir a operação.'
    if (status >= 500) console.error(error)
    return sendJson(response, status, { error: message, code }, origin)
  }
})

server.listen(env.port, '127.0.0.1', () => {
  console.log(`Craft NFC backend disponível em http://127.0.0.1:${env.port}`)
})

function shutdown() {
  server.close(() => process.exit(0))
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
