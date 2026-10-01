import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const AuthContext = createContext(null)

function getAuthErrorMessage(error, fallback) {
  const message = typeof error?.message === 'string' ? error.message.trim() : ''
  const code = typeof error?.code === 'string' ? error.code : ''

  if (code === 'user_already_exists' || /already registered|already exists/i.test(message)) {
    return 'Este e-mail já possui uma conta. Tente fazer login ou recuperar a senha.'
  }
  if (code === 'signup_disabled' || /signups? (?:are )?disabled/i.test(message)) {
    return 'A criação de novas contas está desativada no Supabase.'
  }
  if (code === 'weak_password' || /password/i.test(message) && /weak|least|characters/i.test(message)) {
    return 'A senha não atende aos requisitos de segurança.'
  }
  if (code === 'over_email_send_rate_limit' || /rate limit/i.test(message)) {
    return 'Muitas tentativas foram feitas. Aguarde alguns minutos e tente novamente.'
  }
  if (/database error saving new user/i.test(message)) {
    return 'O banco não conseguiu finalizar o cadastro. Verifique a migration do trigger de usuários.'
  }
  if (!message || message === '{}' || message === '[object Object]') {
    return fallback
  }

  return message
}

async function hydrateUser(authUser) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, organization_id, name, email, avatar_url, role, status, organization:organizations(name)')
    .eq('id', authUser.id)
    .single()
  if (error) throw error
  return {
    ...profile,
    organization_name: profile.organization?.name || '',
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined
    let active = true

    const applySession = async (session) => {
      try {
        const nextUser = session?.user ? await hydrateUser(session.user) : null
        if (active) setUser(nextUser)
      } catch {
        if (active) setUser(null)
      } finally {
        if (active) setLoading(false)
      }
    }

    supabase.auth.getSession().then(({ data }) => applySession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => applySession(session), 0)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email, password) => {
    if (!isSupabaseConfigured) {
      throw new Error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env para entrar.')
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const profile = await hydrateUser(data.user)
    setUser(profile)
    return data
  }

  const logout = async () => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    }
    setUser(null)
  }

  const register = async (email, password, name, organizationName) => {
    if (!isSupabaseConfigured) throw new Error('Configure o Supabase no arquivo .env antes de criar uma conta.')
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { name: name.trim(), organization_name: organizationName.trim() } },
    })
    if (error) {
      throw new Error(getAuthErrorMessage(error, 'Não foi possível criar sua conta. Confira os dados e tente novamente.'), {
        cause: error,
      })
    }
    if (data.session && data.user) setUser(await hydrateUser(data.user))
    return data
  }

  const resetPassword = async (email) => {
    if (!isSupabaseConfigured) throw new Error('Configure o Supabase antes de recuperar a senha.')
    const redirectTo = `${window.location.origin}/reset-password`
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    if (error) throw error
    return data
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, resetPassword, isSupabaseConfigured }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
