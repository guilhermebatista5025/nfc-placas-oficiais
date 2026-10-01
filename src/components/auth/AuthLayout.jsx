import React from 'react'
import logo from '@/assets/logo.jpeg'
import background from '@/assets/fundo-login.png'

export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <main
      className="auth-shell"
      style={{ '--auth-background': `url(${background})` }}
    >
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
