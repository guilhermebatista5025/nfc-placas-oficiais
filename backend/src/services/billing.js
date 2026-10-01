import { randomBytes, randomUUID } from 'node:crypto'
import { env } from '../config/env.js'
import { stripe, supabaseAdmin } from '../lib/clients.js'
import { HttpError } from '../lib/http.js'
import { ACCESS_STATUSES, effectivePlanKey, PLAN_ENTITLEMENTS, PLAN_NAMES, planKeyFromSubscription } from '../config/plans.js'

function integrationIdentifier() {
  const suffix = Array.from(randomBytes(8), (value) => String.fromCharCode(97 + (value % 26))).join('')
  return `craft_nfc_${suffix}`
}

function requireStripe() {
  if (!stripe) throw new HttpError(503, 'Stripe ainda não configurado no backend.', 'stripe_not_configured')
}

async function getOrganization(organizationId) {
  const { data, error } = await supabaseAdmin.from('organizations').select('*').eq('id', organizationId).single()
  if (error || !data) throw new HttpError(404, 'Organização não encontrada.', 'organization_not_found')
  return data
}

async function ensureOrganizationCustomer(organizationId) {
  const organization = await getOrganization(organizationId)
  if (organization.stripe_customer_id) return { organization, customerId: organization.stripe_customer_id }

  const customer = await stripe.customers.create({
    name: organization.name,
    email: organization.email || undefined,
    metadata: { organization_id: organization.id, source: 'craft-nfc-manager' },
  }, { idempotencyKey: `organization-customer-${organization.id}` })

  const { error } = await supabaseAdmin.from('organizations').update({
    stripe_customer_id: customer.id,
    billing_updated_at: new Date().toISOString(),
  }).eq('id', organization.id)
  if (error) throw error
  return { organization: { ...organization, stripe_customer_id: customer.id }, customerId: customer.id }
}

export async function getBillingSummary(organizationId) {
  const organization = await getOrganization(organizationId)
  const planKey = effectivePlanKey(organization, env.stripePrices)
  const { data: invoices, error } = await supabaseAdmin
    .from('billing_invoices')
    .select('id, status, amount_due, amount_paid, currency, hosted_invoice_url, invoice_pdf, due_date, created_at')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(10)
  if (error) throw error

  return {
    configured: Boolean(stripe),
    automaticTaxEnabled: env.stripeAutomaticTaxEnabled,
    subscription: {
      id: organization.stripe_subscription_id || null,
      priceId: organization.stripe_price_id || null,
      plan: organization.plan || null,
      planKey,
      status: organization.billing_status || 'inactive',
      currentPeriodEnd: organization.billing_period_end || null,
      cancelAtPeriodEnd: Boolean(organization.billing_cancel_at_period_end),
    },
    entitlements: PLAN_ENTITLEMENTS[planKey],
    invoices: invoices || [],
  }
}

export async function createCheckoutSession(organizationId, planKey, requestKey) {
  requireStripe()
  const priceId = env.stripePrices[planKey]
  if (!PLAN_NAMES[planKey] || !priceId) throw new HttpError(400, 'Plano inválido ou sem preço Stripe configurado.', 'invalid_plan')

  const { organization, customerId } = await ensureOrganizationCustomer(organizationId)
  if (organization.stripe_subscription_id && ['active', 'trialing', 'past_due'].includes(organization.billing_status)) {
    throw new HttpError(409, 'Esta organização já possui uma assinatura. Use o portal para alterar o plano.', 'subscription_exists')
  }

  const session = await stripe.checkout.sessions.create({
    integration_identifier: integrationIdentifier(),
    mode: 'subscription',
    customer: customerId,
    client_reference_id: organization.id,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    tax_id_collection: { enabled: true },
    customer_update: { address: 'auto', name: 'auto' },
    automatic_tax: { enabled: env.stripeAutomaticTaxEnabled },
    success_url: `${env.frontendUrl}/app/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.frontendUrl}/app/billing?checkout=cancelled`,
    metadata: { organization_id: organization.id, plan_key: planKey },
    subscription_data: { metadata: { organization_id: organization.id, plan_key: planKey } },
  }, { idempotencyKey: requestKey || `checkout-${organization.id}-${planKey}-${randomUUID()}` })

  return { url: session.url }
}

export async function createPortalSession(organizationId, targetPlanKey) {
  requireStripe()
  if (targetPlanKey && !PLAN_NAMES[targetPlanKey]) throw new HttpError(400, 'Plano de destino inválido.', 'invalid_plan')

  const { organization, customerId } = await ensureOrganizationCustomer(organizationId)
  const sessionParams = {
    customer: customerId,
    return_url: `${env.frontendUrl}/app/billing`,
  }

  if (organization.stripe_subscription_id && ACCESS_STATUSES.has(organization.billing_status) && targetPlanKey) {
    const subscription = await stripe.subscriptions.retrieve(organization.stripe_subscription_id)
    const afterCompletion = { type: 'redirect', redirect: { return_url: `${env.frontendUrl}/app/billing` } }

    if (targetPlanKey === 'free') {
      sessionParams.flow_data = {
        type: 'subscription_cancel',
        subscription_cancel: { subscription: subscription.id },
        after_completion: afterCompletion,
      }
    } else {
      const priceId = env.stripePrices[targetPlanKey]
      if (!priceId) throw new HttpError(400, 'Preço Stripe não configurado para este plano.', 'missing_plan_price')
      const item = subscription.items?.data?.[0]
      if (!item) throw new HttpError(409, 'A assinatura não possui um item que possa ser alterado.', 'subscription_item_missing')
      if (item.price?.id !== priceId) {
        sessionParams.flow_data = {
          type: 'subscription_update_confirm',
          subscription_update_confirm: {
            subscription: subscription.id,
            items: [{ id: item.id, price: priceId, quantity: item.quantity || 1 }],
          },
          after_completion: afterCompletion,
        }
      }
    }
  }

  const session = await stripe.billingPortal.sessions.create(sessionParams)
  return { url: session.url }
}

async function ensureClientCustomer(organizationId, clientId) {
  const { data: client, error } = await supabaseAdmin
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .eq('organization_id', organizationId)
    .single()
  if (error || !client) throw new HttpError(404, 'Cliente não encontrado.', 'client_not_found')
  if (!client.email) throw new HttpError(400, 'Cadastre um e-mail no cliente antes de emitir a fatura.', 'client_email_required')
  if (client.stripe_customer_id) return { client, customerId: client.stripe_customer_id }

  const customer = await stripe.customers.create({
    name: client.name,
    email: client.email,
    phone: client.phone || undefined,
    metadata: { organization_id: organizationId, client_id: client.id, source: 'craft-nfc-manager' },
  }, { idempotencyKey: `client-customer-${client.id}` })

  const { error: updateError } = await supabaseAdmin.from('clients')
    .update({ stripe_customer_id: customer.id })
    .eq('id', client.id)
    .eq('organization_id', organizationId)
  if (updateError) throw updateError
  return { client, customerId: customer.id }
}

export async function createServiceInvoice(organizationId, payload, requestKey) {
  requireStripe()
  const clientId = String(payload.clientId || '')
  const description = String(payload.description || '').trim()
  const amount = Number(payload.amount)
  const dueDays = Math.min(90, Math.max(1, Number(payload.dueDays || 7)))
  if (!clientId || !description || !Number.isFinite(amount) || amount < 1) {
    throw new HttpError(400, 'Informe cliente, descrição e um valor válido.', 'invalid_invoice')
  }

  const amountInCents = Math.round(amount * 100)
  const { customerId } = await ensureClientCustomer(organizationId, clientId)
  const idempotencyKey = requestKey || `invoice-${organizationId}-${clientId}-${randomUUID()}`
  const invoice = await stripe.invoices.create({
    customer: customerId,
    collection_method: 'send_invoice',
    days_until_due: dueDays,
    auto_advance: false,
    automatic_tax: { enabled: env.stripeAutomaticTaxEnabled },
    metadata: { organization_id: organizationId, client_id: clientId, source: 'craft-nfc-manager' },
  }, { idempotencyKey })

  await stripe.invoiceItems.create({
    customer: customerId,
    invoice: invoice.id,
    amount: amountInCents,
    currency: 'brl',
    description,
    tax_behavior: 'inclusive',
    metadata: { organization_id: organizationId, client_id: clientId },
  }, { idempotencyKey: `${idempotencyKey}-item` })

  const finalized = await stripe.invoices.finalizeInvoice(invoice.id, { auto_advance: false })
  const sent = await stripe.invoices.sendInvoice(finalized.id)
  await upsertInvoice(sent, organizationId)
  return { id: sent.id, status: sent.status, url: sent.hosted_invoice_url }
}

function unixToIso(value) {
  return value ? new Date(value * 1000).toISOString() : null
}

function subscriptionPeriodEnd(subscription) {
  return subscription.current_period_end || subscription.items?.data?.[0]?.current_period_end || null
}

async function organizationIdFromStripeObject(object) {
  const customerId = typeof object.customer === 'string' ? object.customer : object.customer?.id
  if (customerId) {
    const { data: organization } = await supabaseAdmin.from('organizations').select('id')
      .eq('stripe_customer_id', customerId).maybeSingle()
    if (organization?.id) return organization.id

    const { data: client } = await supabaseAdmin.from('clients').select('organization_id')
      .eq('stripe_customer_id', customerId).maybeSingle()
    if (client?.organization_id) return client.organization_id
  }

  return object.metadata?.organization_id || object.subscription_details?.metadata?.organization_id || null
}

async function upsertInvoice(invoice, fallbackOrganizationId) {
  const organizationId = fallbackOrganizationId || await organizationIdFromStripeObject(invoice)
  if (!organizationId) return
  const { error } = await supabaseAdmin.from('billing_invoices').upsert({
    id: invoice.id,
    organization_id: organizationId,
    stripe_customer_id: typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id,
    status: invoice.status,
    amount_due: invoice.amount_due || 0,
    amount_paid: invoice.amount_paid || 0,
    currency: invoice.currency || 'brl',
    hosted_invoice_url: invoice.hosted_invoice_url || null,
    invoice_pdf: invoice.invoice_pdf || null,
    due_date: unixToIso(invoice.due_date),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' })
  if (error) throw error
}

async function updateOrganizationBilling(organizationId, changes) {
  let { error } = await supabaseAdmin.from('organizations').update(changes).eq('id', organizationId)
  if (error && Object.hasOwn(changes, 'plan_key') && /plan_key/i.test(`${error.message || ''}`)) {
    const legacyChanges = { ...changes }
    delete legacyChanges.plan_key
    ;({ error } = await supabaseAdmin.from('organizations').update(legacyChanges).eq('id', organizationId))
  }
  if (error) throw error
}

async function updateSubscription(subscription) {
  const organizationId = await organizationIdFromStripeObject(subscription)
  if (!organizationId) return

  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id
  const candidates = customerId
    ? (await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 100 })).data
    : [subscription]
  const selected = candidates
    .filter((item) => ACCESS_STATUSES.has(item.status))
    .sort((left, right) => right.created - left.created)[0] || null

  const planKey = selected ? planKeyFromSubscription(selected, env.stripePrices) : 'free'
  const changes = selected ? {
    stripe_customer_id: customerId,
    stripe_subscription_id: selected.id,
    stripe_price_id: selected.items?.data?.[0]?.price?.id || null,
    billing_status: selected.status,
    billing_period_end: unixToIso(subscriptionPeriodEnd(selected)),
    billing_cancel_at_period_end: Boolean(selected.cancel_at_period_end),
    plan_key: planKey || 'free',
    plan: planKey && PLAN_NAMES[planKey] ? `Plano ${PLAN_NAMES[planKey]}` : 'Gratuito',
    billing_updated_at: new Date().toISOString(),
  } : {
    stripe_customer_id: customerId,
    stripe_subscription_id: null,
    stripe_price_id: null,
    billing_status: subscription.status || 'inactive',
    billing_period_end: null,
    billing_cancel_at_period_end: false,
    plan_key: 'free',
    plan: 'Gratuito',
    billing_updated_at: new Date().toISOString(),
  }

  await updateOrganizationBilling(organizationId, changes)
}

export async function processWebhook(rawBody, signature) {
  requireStripe()
  if (!env.stripeWebhookSecret) throw new HttpError(503, 'STRIPE_WEBHOOK_SECRET não configurado.', 'webhook_not_configured')
  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.stripeWebhookSecret)
  } catch {
    throw new HttpError(400, 'Assinatura do webhook inválida.', 'invalid_webhook_signature')
  }

  const { data: previous } = await supabaseAdmin.from('stripe_webhook_events')
    .select('status').eq('id', event.id).maybeSingle()
  if (previous?.status === 'processed') return { received: true, duplicate: true }

  await supabaseAdmin.from('stripe_webhook_events').upsert({
    id: event.id,
    type: event.type,
    livemode: event.livemode,
    status: 'processing',
    last_error: null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' })

  try {
    const object = event.data.object
    if (['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type)
      && object.payment_status !== 'unpaid' && object.subscription) {
      await updateSubscription(await stripe.subscriptions.retrieve(object.subscription))
    } else if (event.type.startsWith('customer.subscription.')) {
      await updateSubscription(object)
    } else if (event.type.startsWith('invoice.')) {
      await upsertInvoice(object)
    }

    await supabaseAdmin.from('stripe_webhook_events').update({
      status: 'processed', processed_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).eq('id', event.id)
  } catch (error) {
    await supabaseAdmin.from('stripe_webhook_events').update({
      status: 'failed', last_error: String(error.message || error).slice(0, 1000), updated_at: new Date().toISOString(),
    }).eq('id', event.id)
    throw error
  }

  return { received: true }
}
