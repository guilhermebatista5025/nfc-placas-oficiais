import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white font-bold font-heading text-2xl shadow-sm mb-3">
            C
          </div>
          <h1 className="text-2xl font-bold font-heading text-mainText">Recuperar Senha</h1>
          <p className="text-xs text-subText mt-1">Enviaremos um link para você redefinir seu acesso</p>
        </div>

        <div className="bg-white rounded-card border border-cardBorder p-8 shadow-card">
          {submitted ? (
            <div className="text-center space-y-3 py-2">
              <div className="mx-auto w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-mainText">Instruções enviadas!</h3>
              <p className="text-xs text-subText">
                Verifique a caixa de entrada do e-mail <strong>{email}</strong> para criar uma nova senha.
              </p>
              <div className="pt-4">
                <Link to="/login">
                  <Button variant="secondary" size="sm" className="w-full">
                    Voltar para o Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Seu e-mail cadastrado"
                type="email"
                icon={Mail}
                placeholder="exemplo@craftevolution.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button type="submit" variant="primary" size="lg" className="w-full mt-2">
                Enviar Link de Recuperação
              </Button>

              <div className="pt-4 border-t border-divider text-center">
                <Link
                  to="/login"
                  className="text-xs text-subText hover:text-mainText inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Voltar para o login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
