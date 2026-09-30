import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    id: 'user-01',
    name: 'Bruno Craft',
    email: 'bruno@craftevolution.com.br',
    role: 'owner', // owner, admin, seller, operator, viewer
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    organization_id: 'org-craft-01',
    organization_name: 'Craft Evolution'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    // Supabase auth subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          email: session.user.email,
          role: session.user.user_metadata?.role || 'owner',
          organization_id: session.user.user_metadata?.organization_id || 'org-craft-01',
          organization_name: 'Craft Evolution'
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email, password) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return data
    } else {
      // Mock login
      setUser({
        id: 'user-01',
        name: email.split('@')[0] || 'Usuário Craft',
        email,
        role: 'owner',
        organization_id: 'org-craft-01',
        organization_name: 'Craft Evolution'
      })
      return { user }
    }
  }

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
    setUser(null)
  }

  const register = async (email, password, name, orgName) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, orgName, role: 'owner' }
        }
      })
      if (error) throw error
      return data
    } else {
      setUser({
        id: 'user-' + Date.now(),
        name,
        email,
        role: 'owner',
        organization_id: 'org-' + Date.now(),
        organization_name: orgName
      })
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, isSupabaseConfigured }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
