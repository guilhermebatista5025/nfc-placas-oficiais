import { supabase } from '@/lib/supabase'

const apiUrl = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001').replace(/\/$/, '')

async function apiRequest(path, options = {}) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Sua sessão expirou. Entre novamente.')

  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.body ? { 'Idempotency-Key': crypto.randomUUID() } : {}),
      ...options.headers,
    },
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || 'Não foi possível concluir a operação no Stripe.')
  return payload
}

export function fetchBillingSummary() {
  return apiRequest('/api/billing/summary')
}

export function startCheckout(planKey) {
  return apiRequest('/api/billing/checkout', { method: 'POST', body: JSON.stringify({ planKey }) })
}

export function openBillingPortal(planKey) {
  return apiRequest('/api/billing/portal', { method: 'POST', body: JSON.stringify({ planKey }) })
}

export function createStripeInvoice(invoice) {
  return apiRequest('/api/billing/invoices', { method: 'POST', body: JSON.stringify(invoice) })
}
