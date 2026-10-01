import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    if (password.length < 6) return setError('A senha precisa ter pelo menos 6 caracteres.')
    if (password !== confirmation) return setError('As senhas não conferem.')
    setLoading(true)
    setError('')
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (updateError) return setError(updateError.message)
    navigate('/app', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] p-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-card border border-cardBorder bg-white p-8 shadow-card">
        <div><h1 className="text-xl font-bold text-mainText">Definir nova senha</h1><p className="mt-1 text-xs text-subText">Escolha uma senha segura para sua conta.</p></div>
        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
        <Input label="Nova senha" type="password" icon={Lock} value={password} onChange={(event) => setPassword(event.target.value)} required />
        <Input label="Confirmar senha" type="password" icon={Lock} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required />
        <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>Salvar nova senha</Button>
        <Link to="/login" className="block text-center text-xs text-primary">Voltar ao login</Link>
      </form>
    </div>
  )
}
