export const PLAN_NAMES = Object.freeze({
  free: 'Gratuito',
  starter: 'Starter',
  pro: 'Pro',
  business: 'Business',
})

export const PLAN_ENTITLEMENTS = Object.freeze({
  free: Object.freeze({ limits: { users: 1, clients: 5, plates: 10 }, features: ['dashboard', 'clients', 'plates', 'sales', 'inventory'] }),
  starter: Object.freeze({ limits: { users: 1, clients: 50, plates: 200 }, features: ['dashboard', 'clients', 'plates', 'sales', 'inventory', 'finance'] }),
  pro: Object.freeze({ limits: { users: 5, clients: 500, plates: 2000 }, features: ['dashboard', 'clients', 'plates', 'sales', 'inventory', 'finance', 'reports', 'credentials', 'team'] }),
  business: Object.freeze({ limits: { users: null, clients: null, plates: null }, features: ['dashboard', 'clients', 'plates', 'sales', 'inventory', 'finance', 'reports', 'credentials', 'team', 'business'] }),
})

export const ACCESS_STATUSES = new Set(['active', 'trialing', 'past_due'])

export function planKeyFromSubscription(subscription, stripePrices) {
  const metadataKey = `${subscription?.metadata?.plan_key || ''}`.toLowerCase()
  if (PLAN_NAMES[metadataKey] && metadataKey !== 'free') return metadataKey

  const priceId = subscription?.items?.data?.[0]?.price?.id
  return Object.entries(stripePrices).find(([, configuredPriceId]) => configuredPriceId === priceId)?.[0] || null
}

export function effectivePlanKey(organization, stripePrices) {
  if (!ACCESS_STATUSES.has(organization?.billing_status)) return 'free'
  const storedKey = `${organization?.plan_key || ''}`.toLowerCase()
  if (PLAN_NAMES[storedKey] && storedKey !== 'free') return storedKey

  const priceKey = Object.entries(stripePrices).find(([, priceId]) => priceId === organization?.stripe_price_id)?.[0]
  if (priceKey) return priceKey

  const label = `${organization?.plan || ''}`.toLowerCase()
  return Object.keys(PLAN_NAMES).find((key) => key !== 'free' && label.includes(key)) || 'free'
}
