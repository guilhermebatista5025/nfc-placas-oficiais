import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env.js'

export const stripe = env.stripeSecretKey
  ? new Stripe(env.stripeSecretKey, { maxNetworkRetries: 2, timeout: 20_000 })
  : null

export const supabaseAdmin = env.supabaseConfigured
  ? createClient(env.supabaseUrl, env.serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null
