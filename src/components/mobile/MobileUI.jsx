import React from 'react'
import { ArrowLeft, Bell, ChevronRight, CreditCard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function MobilePage({ children, className = '' }) {
  return <div className={`mobile-page ${className}`}>{children}</div>
}

export function MobileHeader({ title, subtitle, back = false, actions, compact = false, onNotifications }) {
  const navigate = useNavigate()

  return (
    <header className={`mobile-header ${compact ? 'mobile-header--compact' : ''}`}>
      <div className="flex items-center gap-3 min-w-0">
        {back ? (
          <button className="mobile-icon-button" type="button" onClick={() => navigate(-1)} aria-label="Voltar">
            <ArrowLeft size={20} />
          </button>
        ) : (
          <div className="mobile-brand-mark">C</div>
        )}
        <div className="min-w-0">
          {subtitle && <p className="text-[11px] font-semibold text-slate-400">{subtitle}</p>}
          <h1 className="truncate text-[17px] font-extrabold tracking-tight text-slate-900">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {actions || (
          <>
            <button
              className="mobile-icon-button"
              type="button"
              aria-label="Planos e assinatura"
              title="Planos e assinatura"
              onClick={() => navigate('/app/billing')}
            >
              <CreditCard size={19} />
            </button>
            <button className="mobile-icon-button relative" type="button" aria-label="Notificações" onClick={onNotifications}>
              <Bell size={19} />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
          </>
        )}
      </div>
    </header>
  )
}

export function SectionTitle({ title, detail, action, onAction }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4 px-0.5">
      <div>
        <h2 className="text-[15px] font-extrabold tracking-tight text-slate-900">{title}</h2>
        {detail && <p className="mt-0.5 text-[11px] font-medium text-slate-400">{detail}</p>}
      </div>
      {action && (
        <button type="button" onClick={onAction} className="flex shrink-0 items-center text-xs font-bold text-blue-600">
          {action}<ChevronRight size={15} />
        </button>
      )}
    </div>
  )
}

export function StatusPill({ tone = 'slate', children }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    slate: 'bg-slate-100 text-slate-600',
  }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold ${tones[tone]}`}>{children}</span>
}

export function EmptyMobile({ children }) {
  return <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-400">{children}</div>
}
