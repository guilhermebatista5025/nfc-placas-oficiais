import React from 'react'
import { CreditCard, Check, Sparkles, Zap, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useApp } from '@/contexts/AppContext'

export function Billing() {
  const { organization } = useApp()

  const plans = [
    {
      name: 'Starter',
      price: 'R$ 97',
      period: '/mês',
      description: 'Ideal para profissionais autônomos ou início da operação.',
      features: [
        '1 usuário',
        'Até 50 clientes',
        'Até 200 placas NFC',
        'Dashboard básico',
        'Gestão de vendas',
        'Suporte por e-mail'
      ],
      current: false,
      popular: false
    },
    {
      name: 'Pro',
      price: 'R$ 247',
      period: '/mês',
      description: 'Perfeito para empresas em expansão e controle total de equipes.',
      features: [
        '5 usuários incluídos',
        'Até 500 clientes cadastrados',
        'Até 2.000 placas NFC',
        'Relatórios financeiros e DRE',
        'Cofre seguro de credenciais Google',
        'Auditoria e logs de placas',
        'Suporte prioritário via WhatsApp'
      ],
      current: true,
      popular: true
    },
    {
      name: 'Business',
      price: 'R$ 597',
      period: '/mês',
      description: 'Estrutura robusta para grandes volumes e operações franqueadas.',
      features: [
        'Usuários ilimitados',
        'Clientes ilimitados',
        'Placas NFC ilimitadas',
        'Permissões personalizadas (RBAC avançado)',
        'Integrações com Google APIs e Webhooks',
        'Gerente de conta exclusivo'
      ],
      current: false,
      popular: false
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-mainText">Assinatura & Planos SaaS</h1>
        <p className="text-xs text-subText mt-1">
          Gerenciamento do plano da sua organização, faturamento e limites de placas contratadas.
        </p>
      </div>

      {/* Current Subscription Card */}
      <div className="bg-white rounded-card border border-cardBorder p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-subText">Plano Atual</span>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full">
              {organization?.plan || 'Plano Pro'}
            </span>
          </div>
          <p className="text-lg font-bold font-heading text-mainText mt-1">
            Renovação programada para 15 de Outubro de 2026
          </p>
          <p className="text-xs text-subText mt-0.5">
            Organização: {organization?.name} • Pagamento via Cartão Corporativo (•••• 4129)
          </p>
        </div>
        <Button variant="outline" size="sm">
          Gerenciar Pagamento
        </Button>
      </div>

      {/* Plans Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`bg-white rounded-card border p-6 flex flex-col justify-between relative transition-all ${
              p.current
                ? 'border-primary ring-2 ring-primary/20 shadow-lg'
                : 'border-cardBorder shadow-card'
            }`}
          >
            {p.popular && (
              <span className="absolute -top-3 right-6 bg-primary text-white text-[10px] uppercase font-bold tracking-wider px-3 py-0.5 rounded-full shadow-sm">
                Mais Recomendado
              </span>
            )}

            <div>
              <h3 className="text-lg font-bold font-heading text-mainText">{p.name}</h3>
              <p className="text-xs text-subText mt-1 min-h-[32px]">{p.description}</p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold font-heading text-mainText">{p.price}</span>
                <span className="text-xs text-subText font-medium">{p.period}</span>
              </div>

              <div className="mt-6 pt-4 border-t border-divider space-y-2.5 text-xs">
                {p.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-mainText">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <Button
                variant={p.current ? 'primary' : 'outline'}
                className="w-full justify-center"
                disabled={p.current}
              >
                {p.current ? 'Plano Ativo' : 'Fazer Upgrade'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
