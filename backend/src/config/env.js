const parsedPort = Number(process.env.PORT || 3001)

if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
  throw new Error('PORT precisa ser um número entre 1 e 65535.')
}

const supabaseUrl = process.env.SUPABASE_URL?.trim() || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || ''
const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim() || ''
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim() || ''
const vercelHost = process.env.VERCEL_ENV === 'production'
  ? process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  : process.env.VERCEL_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL

if (Boolean(supabaseUrl) !== Boolean(serviceRoleKey)) {
  throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem ser configuradas juntas.')
}

export const env = Object.freeze({
  port: parsedPort,
  frontendUrl: process.env.FRONTEND_URL?.trim() || (vercelHost ? `https://${vercelHost}` : 'http://localhost:5173'),
  supabaseUrl,
  serviceRoleKey,
  supabaseConfigured: Boolean(supabaseUrl && serviceRoleKey),
  stripeSecretKey,
  stripeWebhookSecret,
  stripeAutomaticTaxEnabled: /^(1|true|yes)$/i.test(process.env.STRIPE_AUTOMATIC_TAX_ENABLED || ''),
  stripePrices: Object.freeze({
    starter: process.env.STRIPE_PRICE_STARTER?.trim() || '',
    pro: process.env.STRIPE_PRICE_PRO?.trim() || '',
    business: process.env.STRIPE_PRICE_BUSINESS?.trim() || '',
  }),
})
