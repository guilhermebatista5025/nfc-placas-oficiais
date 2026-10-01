import { supabaseAdmin } from '../lib/clients.js'
import { HttpError } from '../lib/http.js'

export async function requireAuth(request, roles = []) {
  if (!supabaseAdmin) throw new HttpError(503, 'Supabase não configurado no backend.', 'supabase_not_configured')

  const authorization = request.headers.authorization || ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : ''
  if (!token) throw new HttpError(401, 'Sessão não informada.', 'missing_token')

  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !authData.user) throw new HttpError(401, 'Sessão inválida ou expirada.', 'invalid_token')

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, organization_id, name, email, role, status')
    .eq('id', authData.user.id)
    .single()

  if (profileError || !profile || profile.status !== 'active') {
    throw new HttpError(403, 'Perfil sem acesso à organização.', 'profile_forbidden')
  }
  if (roles.length && !roles.includes(profile.role)) {
    throw new HttpError(403, 'Você não possui permissão para gerenciar cobranças.', 'role_forbidden')
  }

  return { authUser: authData.user, profile }
}
