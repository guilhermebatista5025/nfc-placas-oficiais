import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { AuthField, AuthLayout, AuthSubmitButton } from '@/components/auth/AuthLayout'
import { useAuth } from '@/contexts/AuthContext'

export function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (password.length < 6) return setError('A senha precisa ter pelo menos 6 caracteres.')
    if (password !== confirmation) return setError('As senhas não conferem.')

    setLoading(true)
    setError('')
    try {
      const result = await register(email, password, name, organizationName)
      if (result.session) navigate('/app/billing', { replace: true })
      else navigate('/login', { state: { notice: 'Conta criada. Confirme seu e-mail antes de entrar.' } })
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível criar sua conta.')
    } finally {
      setLoading(false)
    }
  }

  const passwordAction = (
    <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Ocultar senhas' : 'Mostrar senhas'}>
      {showPassword ? <EyeOff size={21} /> : <Eye size={21} />}
    </button>
  )

  return (
    <AuthLayout title="Crie sua conta" subtitle="Comece a organizar sua operação NFC">
      <div className="auth-messages" aria-live="polite">
        {error && <p className="auth-alert auth-alert--error">{error}</p>}
      </div>

      <form className="auth-form auth-form--register" onSubmit={handleSubmit}>
        <AuthField icon={UserRound} label="Seu nome completo" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
        <AuthField icon={Building2} label="Nome da empresa" value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} autoComplete="organization" required />
        <AuthField icon={Mail} label="E-mail corporativo" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
        <AuthField icon={LockKeyhole} label="Senha (mínimo 6 caracteres)" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required action={passwordAction} />
        <AuthField icon={LockKeyhole} label="Confirmar senha" type={showPassword ? 'text' : 'password'} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" required />

        <AuthSubmitButton loading={loading}>Criar conta</AuthSubmitButton>
      </form>

      <div className="auth-switch">
        <span>Já possui uma conta?</span>
        <Link to="/login">Fazer login</Link>
      </div>
    </AuthLayout>
  )
}
