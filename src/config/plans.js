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
    name: 'Pro',
    price: 39.99,
    limits: { users: 5, clients: 500, plates: 2000 },
    features: ['5 usuários', 'Até 500 clientes', 'Até 2.000 placas', 'Relatórios, cofre e equipe'],
    access: ['dashboard', 'clients', 'plates', 'sales', 'inventory', 'finance', 'reports', 'credentials', 'team'],
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
