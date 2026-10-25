import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Layers3,
  Sparkles,
  X,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PLAN_CATALOG } from '@/config/plans'
import { confirmCheckoutSession, fetchBillingSummary, openBillingPortal, startCheckout } from '@/services/billing'

const plans = [
  { ...PLAN_CATALOG.pro, icon: BriefcaseBusiness, popular: true, description: 'Operação completa, sem limite de placas, clientes ou equipe.' },
]

export function Billing() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [checkoutSync, setCheckoutSync] = useState('')

  const checkoutNotice = searchParams.get('checkout')
  const checkoutSessionId = searchParams.get('session_id')
  const subscription = summary?.subscription
  const activePlan = useMemo(() => {
    if (subscription?.planKey && PLAN_CATALOG[subscription.planKey]) return subscription.planKey
    const label = `${subscription?.plan || ''}`.toLowerCase()
    const paidPlan = plans.find((plan) => plan.key !== 'free' && label.includes(plan.key))?.key
    return ['active', 'trialing', 'past_due'].includes(subscription?.status) && paidPlan ? paidPlan : 'free'
  }, [subscription?.plan, subscription?.planKey, subscription?.status])

  useEffect(() => {
    let active = true
    const syncBilling = async () => {
      const startedAt = Date.now()
      let firstRequest = true

      while (active) {
        try {
          const confirmation = checkoutNotice === 'success' && checkoutSessionId
            ? await confirmCheckoutSession(checkoutSessionId)
            : null
          const data = await fetchBillingSummary()
          if (!active) return
          setSummary(data)
          setError('')
          if (confirmation?.confirmed && ['active', 'trialing', 'past_due'].includes(data.subscription?.status)) {
            setCheckoutSync('confirmed')
            break
          }
          if (checkoutNotice !== 'success' || !checkoutSessionId) break
          setCheckoutSync('pending')
        } catch (requestError) {
          if (!active) return
          setError(requestError.message)
        } finally {
          if (firstRequest && active) {
            setLoading(false)
            firstRequest = false
          }
        }

        if (checkoutNotice !== 'success' || !checkoutSessionId) break
        if (Date.now() - startedAt >= 120_000) {
          if (active) setCheckoutSync('delayed')
          break
        }
        await new Promise((resolve) => window.setTimeout(resolve, 3000))
      }

      if (active) setLoading(false)
    }

    syncBilling()
    return () => { active = false }
  }, [checkoutNotice, checkoutSessionId])

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
    if (hasPaidSubscription) return redirect(() => openBillingPortal(planKey), `plan-${planKey}`)
    return redirect(() => startCheckout(planKey), `plan-${planKey}`)
  }

  const cancelSubscription = () => redirect(() => openBillingPortal('free'), 'cancel-subscription')

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
        <h1>Tudo que você precisa<br />por um preço só</h1>
        <p>Um plano completo para gerenciar sua operação NFC sem limite de placas.</p>
        <span className="pricing-test-badge"><Sparkles size={12} /> Cobrança mensal pelo Stripe</span>
      </header>

      {checkoutNotice === 'success' && (
        <Notice tone={checkoutSync === 'confirmed' ? 'success' : 'warning'}>
          {checkoutSync === 'confirmed'
            ? 'Pagamento confirmado. Seu plano foi ativado automaticamente.'
            : checkoutSync === 'delayed'
              ? 'A Stripe ainda está processando a confirmação. Recarregue esta tela em instantes.'
              : 'Pagamento concluído. Confirmando e ativando seu plano automaticamente...'}
        </Notice>
      )}
      {checkoutNotice === 'cancelled' && (
        <Notice tone="warning">Checkout cancelado. Nenhuma cobrança foi realizada.</Notice>
      )}
      {error && <Notice tone="error">{error}</Notice>}

      <section className="pricing-carousel pricing-carousel--single mobile-carousel" aria-label="Plano disponível">
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
                    : hasPaidSubscription
                      ? `Mudar para ${plan.name}`
                      : `Assinar ${plan.name}`}</span>
                {!current && !planBusy && <ArrowRight size={20} />}
              </button>
            </article>
          )
        })}
      </section>

      {hasPaidSubscription && (
        <button type="button" className="pricing-cancel" disabled={Boolean(busy)} onClick={cancelSubscription}>
          {busy === 'cancel-subscription' ? 'Abrindo Stripe...' : 'Cancelar assinatura'}
        </button>
      )}
      <div className="pricing-scroll-hint"><span /> Uma assinatura, todos os recursos <span /></div>
    </div>
  )
}

function Notice({ tone, children }) {
  return <div className={`pricing-notice pricing-notice--${tone}`}>{children}</div>
}

function formatPlanPrice(value) {
  return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
