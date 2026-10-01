import React from 'react'
import { LockKeyhole, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/contexts/AppContext'

export function PlanGate({ feature, title, requiredPlan = 'Pro', children }) {
  const navigate = useNavigate()
  const { entitlements, hasFeature } = useApp()

  if (hasFeature(feature)) return children

  return (
    <div className="mobile-page grid min-h-[calc(100dvh-90px)] place-items-center py-10">
      <section className="mobile-card w-full p-7 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] bg-blue-50 text-blue-600">
          <LockKeyhole size={29} />
        </span>
        <span className="mt-5 inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider text-indigo-600">
          <Sparkles size={11} /> Recurso premium
        </span>
        <h1 className="mt-3 text-xl font-black text-slate-900">{title}</h1>
        <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-slate-500">
          Seu plano atual é {entitlements.name}. Este recurso fica disponível a partir do plano {requiredPlan}.
        </p>
        <button type="button" onClick={() => navigate('/app/billing')} className="mt-6 w-full rounded-2xl bg-blue-600 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-blue-200">
          Ver planos e desbloquear
        </button>
        <button type="button" onClick={() => navigate('/app')} className="mt-3 text-[10px] font-bold text-slate-400">Voltar ao início</button>
      </section>
    </div>
  )
}
