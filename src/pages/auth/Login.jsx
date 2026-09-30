import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('bruno@craftevolution.com.br')
  const [password, setPassword] = useState('••••••••')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate('/app')
    } catch (err) {
      setError(err.message || 'Erro ao realizar login. Verifique suas credenciais.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white font-bold font-heading text-2xl shadow-sm mb-3">
            C
          </div>
          <h1 className="text-2xl font-bold font-heading text-mainText">Craft NFC Manager</h1>
          <p className="text-xs text-subText mt-1">Plataforma SaaS de Gestão de Placas NFC & Avaliações</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-card border border-cardBorder p-8 shadow-card">
          <h2 className="text-base font-bold text-mainText mb-4">Acesse sua conta</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail de Acesso"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div>
              <Input
                label="Senha"
                type="password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="flex justify-end mt-1.5">
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Esqueceu a senha?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={loading}
            >
              Entrar na Plataforma
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-divider text-center text-xs text-subText">
            Não tem uma conta ainda?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Cadastre sua empresa
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-[11px] text-subText flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Ambiente seguro protegido por Supabase RLS</span>
        </div>
      </div>
    </div>
  )
}
