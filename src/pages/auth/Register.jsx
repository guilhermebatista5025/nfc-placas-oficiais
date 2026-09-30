import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Building2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'

export function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [orgName, setOrgName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register(email, password, name, orgName)
      navigate('/app')
    } catch (err) {
      setError(err.message || 'Erro ao registrar nova empresa.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white font-bold font-heading text-2xl shadow-sm mb-3">
            C
          </div>
          <h1 className="text-2xl font-bold font-heading text-mainText">Criar Nova Conta SaaS</h1>
          <p className="text-xs text-subText mt-1">Comece a gerenciar suas placas NFC e clientes</p>
        </div>

        <div className="bg-white rounded-card border border-cardBorder p-8 shadow-card">
          <h2 className="text-base font-bold text-mainText mb-4">Cadastro da Empresa</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome Completo"
              icon={User}
              placeholder="Ex: Carlos Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Nome da Sua Empresa (Organização)"
              icon={Building2}
              placeholder="Ex: Minha Empresa NFC"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
            />

            <Input
              label="E-mail Corporativo"
              type="email"
              icon={Mail}
              placeholder="contato@suaempresa.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Senha de Acesso"
              type="password"
              icon={Lock}
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={loading}
            >
              Criar Conta e Iniciar Teste Grátis
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-divider text-center text-xs text-subText">
            Já possui uma conta?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Fazer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
