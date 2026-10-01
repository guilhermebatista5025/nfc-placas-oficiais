import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { AuthField, AuthLayout, AuthSubmitButton } from '@/components/auth/AuthLayout'
import { useAuth } from '@/contexts/AuthContext'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password, { remember })
      navigate(location.state?.from || '/app', { replace: true })
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível entrar. Verifique suas credenciais.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Entre para continuar"
      footer={<><ShieldCheck size={15} /> Ambiente protegido pelo Supabase</>}
    >
      <div className="auth-messages" aria-live="polite">
        {error && <p className="auth-alert auth-alert--error">{error}</p>}
        {location.state?.notice && <p className="auth-alert auth-alert--success">{location.state.notice}</p>}
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <AuthField
          icon={Mail}
          label="E-mail"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

        <AuthField
          icon={LockKeyhole}
          label="Senha"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          action={(
            <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
              {showPassword ? <EyeOff size={21} /> : <Eye size={21} />}
            </button>
          )}
        />

        <div className="auth-form-options">
          <label className="auth-checkbox">
            <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
            <span aria-hidden="true">✓</span>
            Lembrar de mim
          </label>
          <Link to="/forgot-password">Esqueceu a senha?</Link>
        </div>

        <AuthSubmitButton loading={loading}>Entrar</AuthSubmitButton>
      </form>

      <div className="auth-switch">
        <span>Primeiro acesso?</span>
        <Link to="/register">Criar minha conta</Link>
      </div>
    </AuthLayout>
  )
}
