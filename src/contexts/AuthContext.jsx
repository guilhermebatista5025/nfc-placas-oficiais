import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const AuthContext = createContext(null)

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
      email,
      password,
      options: { data: { name, organization_name: organizationName } },
    })
    if (error) throw error
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
