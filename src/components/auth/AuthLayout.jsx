import React, { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import logo from '@/assets/logo.jpeg'
import background from '@/assets/fundo-login.png'

export function AuthLayout({ title, subtitle, children, footer }) {
  const [dimmed, setDimmed] = useState(false)

  return (
    <main
      className={`auth-shell${dimmed ? ' auth-shell--dimmed' : ''}`}
      style={{ '--auth-background': `url(${background})` }}
    >
      <button
        type="button"
        className="auth-theme-toggle"
        aria-label={dimmed ? 'Ativar tema claro' : 'Reduzir brilho'}
        aria-pressed={dimmed}
        onClick={() => setDimmed((current) => !current)}
      >
        {dimmed ? <Sun size={19} /> : <Moon size={19} />}
      </button>

      <section className="auth-panel">
        <div className="auth-logo-card">
          <img src={logo} alt="Craft Evolution Digital Architects" />
        </div>

        <header className="auth-heading">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </header>

        {children}

        {footer && <footer className="auth-footer">{footer}</footer>}
      </section>
    </main>
  )
}

export function AuthField({ icon: Icon, label, action, className = '', ...props }) {
  return (
    <label className={`auth-field ${className}`}>
      <span className="sr-only">{label}</span>
      {Icon && <Icon className="auth-field__icon" size={22} aria-hidden="true" />}
      <input aria-label={label} placeholder={label} {...props} />
      {action && <span className="auth-field__action">{action}</span>}
    </label>
  )
}

export function AuthSubmitButton({ loading, children }) {
  return (
    <button type="submit" className="auth-submit" disabled={loading}>
      <span>{loading ? 'Aguarde...' : children}</span>
      <span className="auth-submit__arrow" aria-hidden="true">→</span>
    </button>
  )
}
