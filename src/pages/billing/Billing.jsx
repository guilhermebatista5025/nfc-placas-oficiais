import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  Layers3,
  Rocket,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PLAN_CATALOG } from '@/config/plans'
import { fetchBillingSummary, openBillingPortal, startCheckout } from '@/services/billing'

const plans = [
  { ...PLAN_CATALOG.free, icon: UserRound, description: 'Para conhecer e começar sem custo.' },
  { ...PLAN_CATALOG.starter, icon: Rocket, description: 'Para começar sua operação digital.' },
  { ...PLAN_CATALOG.pro, icon: BriefcaseBusiness, popular: true, description: 'Para empresas prontas para crescer.' },
  { ...PLAN_CATALOG.business, icon: Building2, description: 'Para grandes equipes e operações.' },
]

export function Billing() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  const checkoutNotice = searchParams.get('checkout')
  const subscription = summary?.subscription
  const activePlan = useMemo(() => {
    if (subscription?.planKey && PLAN_CATALOG[subscription.planKey]) return subscription.planKey
    const label = `${subscription?.plan || ''}`.toLowerCase()
    const paidPlan = plans.find((plan) => plan.key !== 'free' && label.includes(plan.key))?.key
    return ['active', 'trialing', 'past_due'].includes(subscription?.status) && paidPlan ? paidPlan : 'free'
  }, [subscription?.plan, subscription?.planKey, subscription?.status])

  useEffect(() => {
    let active = true
    fetchBillingSummary()
      .then((data) => { if (active) setSummary(data) })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const redirect = async (action, key) => {
    setBusy(key)
    setError('')
    try {
      const result = await action()
      if (!result.url) throw new Error('O Stripe não retornou o endereço de pagamento.')
      window.location.assign(result.url)
    } catch (requestError) {
      setError(requestError.message)
      setBusy('')
    }
  }

  const handlePlan = (planKey) => {
    if (planKey === 'free') {
      if (hasPaidSubscription) return redirect(() => openBillingPortal('free'), 'plan-free')
      return navigate('/app')
    }
    if (hasPaidSubscription) return redirect(() => openBillingPortal(planKey), `plan-${planKey}`)
    return redirect(() => startCheckout(planKey), `plan-${planKey}`)
  }

  const hasPaidSubscription = subscription?.id && ['active', 'trialing', 'past_due'].includes(subscription?.status)

  return (
    <div className="pricing-page">
      <div className="pricing-orb pricing-orb--top" />
      <div className="pricing-orb pricing-orb--right" />
      <button type="button" className="pricing-close" onClick={() => navigate('/app')} aria-label="Fechar planos" title="Fechar">
        <X size={21} />
      </button>

      <header className="pricing-hero">
        <span className="pricing-kicker"><Layers3 size={16} /> Planos e Preços</span>
        <h1>Escolha o plano<br />ideal para você</h1>
        <p>Recursos poderosos para começar agora e escalar conforme o seu negócio cresce.</p>
        <span className="pricing-test-badge"><Sparkles size={12} /> Ambiente de teste Stripe</span>
      </header>

      {checkoutNotice === 'success' && (
        <Notice tone="success">Pagamento concluído. O plano será atualizado após a confirmação do webhook.</Notice>
      )}
      {checkoutNotice === 'cancelled' && (
        <Notice tone="warning">Checkout cancelado. Nenhuma cobrança foi realizada.</Notice>
      )}
      {error && <Notice tone="error">{error}</Notice>}

      <section className="pricing-carousel mobile-carousel" aria-label="Planos disponíveis">
        {plans.map((plan) => {
          const Icon = plan.icon
          const current = activePlan === plan.key
          const planBusy = busy === `plan-${plan.key}`

          return (
            <article key={plan.key} className={`pricing-card${plan.popular ? ' pricing-card--popular' : ''}`}>
              {plan.popular && <span className="pricing-ribbon">Mais popular</span>}
              <span className="pricing-plan-icon"><Icon size={25} /></span>
              <h2>{plan.name}</h2>
              <p className="pricing-plan-description">{plan.description}</p>

              <ul className="pricing-features">
                {plan.features.map((feature) => (
                  <li key={feature}><span><Check size={14} /></span>{feature}</li>
                ))}
              </ul>

              <div className="pricing-price">
                <small>R$</small>
                <strong>{formatPlanPrice(plan.price)}</strong>
                <span>/mês</span>
              </div>

              <button
                type="button"
                className={`pricing-cta${plan.popular ? ' pricing-cta--primary' : ''}`}
                disabled={current || loading || Boolean(busy)}
                onClick={() => handlePlan(plan.key)}
              >
                <span>{planBusy
                  ? 'Abrindo Stripe...'
                  : current
                    ? 'Plano atual'
                    : plan.key === 'free'
                      ? 'Cancelar e usar grátis'
                      : hasPaidSubscription
                        ? `Mudar para ${plan.name}`
                        : `Assinar ${plan.name}`}</span>
                {!current && !planBusy && <ArrowRight size={20} />}
              </button>
            </article>
          )
        })}
      </section>

      <div className="pricing-scroll-hint"><span /> Arraste para ver todos os planos <span /></div>
    </div>
  )
}

function Notice({ tone, children }) {
  return <div className={`pricing-notice pricing-notice--${tone}`}>{children}</div>
}

function formatPlanPrice(value) {
  return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
