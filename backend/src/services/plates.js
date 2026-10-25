import { env } from '../config/env.js'
import { supabaseAdmin } from '../lib/clients.js'

export async function getPlateRedirectDestination(plateId) {
  if (!env.supabaseConfigured || !supabaseAdmin) return null

  const { data: plate, error } = await supabaseAdmin
    .from('plates')
    .select('google_review_url, status')
    .eq('id', plateId)
    .maybeSingle()
  if (error) throw error
  if (!plate || plate.status === 'disabled' || !plate.google_review_url) return null

  try {
    const destination = new URL(plate.google_review_url)
    if (destination.protocol !== 'https:') return null
    return destination.href
  } catch {
    return null
  }
}
