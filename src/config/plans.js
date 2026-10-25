export const PLAN_ORDER = Object.freeze(['free', 'starter', 'pro', 'business'])

export const PLAN_CATALOG = Object.freeze({
  free: {
    key: 'free',
    name: 'Gratuito',
    price: 0,
    limits: { users: 1, clients: 5, plates: 10 },
    features: ['1 usuário', 'Até 5 clientes', 'Até 10 placas NFC', 'Dashboard e vendas básicas'],
    access: ['dashboard', 'clients', 'plates', 'sales', 'inventory'],
  },
  starter: {
    key: 'starter',
    name: 'Starter',
    price: 9.99,
    limits: { users: 1, clients: 50, plates: 200 },
    features: ['1 usuário', 'Até 50 clientes', 'Até 200 placas NFC', 'Financeiro e operação completa'],
    access: ['dashboard', 'clients', 'plates', 'sales', 'inventory', 'finance'],
  },
  pro: {
    key: 'pro',
    name: 'Craft Completo',
    price: 19.99,
    limits: { users: null, clients: null, plates: null },
    features: ['Usuários ilimitados', 'Clientes ilimitados', 'Placas NFC ilimitadas', 'Todos os recursos incluídos'],
    access: ['dashboard', 'clients', 'plates', 'sales', 'inventory', 'finance', 'reports', 'credentials', 'team', 'business'],
  },
  business: {
    key: 'business',
    name: 'Business',
    price: 99.90,
    limits: { users: null, clients: null, plates: null },
    features: ['Usuários ilimitados', 'Clientes ilimitados', 'Placas ilimitadas', 'Todos os recursos e suporte dedicado'],
    access: ['dashboard', 'clients', 'plates', 'sales', 'inventory', 'finance', 'reports', 'credentials', 'team', 'business'],
  },
})

const ACCESS_STATUSES = new Set(['active', 'trialing', 'past_due'])

export function resolvePlanKey(organization) {
  const storedKey = `${organization?.plan_key || ''}`.toLowerCase()
  const planLabel = `${organization?.plan || ''}`.toLowerCase()
  const candidate = PLAN_CATALOG[storedKey]
    ? storedKey
    : PLAN_ORDER.find((key) => key !== 'free' && planLabel.includes(key)) || 'free'

  if (candidate === 'free') return 'free'
  return ACCESS_STATUSES.has(organization?.billing_status) ? candidate : 'free'
}

export function getPlanEntitlements(organization) {
  const planKey = resolvePlanKey(organization)
  return { ...PLAN_CATALOG[planKey], access: new Set(PLAN_CATALOG[planKey].access) }
}

export function planHasFeature(organization, feature) {
  return getPlanEntitlements(organization).access.has(feature)
}
