import React from 'react'
import { cn } from '@/lib/utils'

export const plateStatusConfig = {
  in_stock: {
    label: 'Em estoque',
    dotColor: 'bg-emerald-500',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  reserved: {
    label: 'Reservada',
    dotColor: 'bg-amber-500',
    className: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  sold: {
    label: 'Vendida',
    dotColor: 'bg-blue-500',
    className: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  configuring: {
    label: 'Configurando',
    dotColor: 'bg-purple-500',
    className: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  active: {
    label: 'Ativa',
    dotColor: 'bg-green-500',
    className: 'bg-green-50 text-green-700 border-green-200'
  },
  disabled: {
    label: 'Desativada',
    dotColor: 'bg-gray-400',
    className: 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

export function Badge({
  children,
  variant = 'neutral',
  status,
  dot = false,
  className,
  ...props
}) {
  if (status && plateStatusConfig[status]) {
    const config = plateStatusConfig[status]
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
          config.className,
          className
        )}
        {...props}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", config.dotColor)} />
        {children || config.label}
      </span>
    )
  }

  const variants = {
    primary: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    neutral: "bg-gray-100 text-gray-700 border-gray-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200"
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variants[variant] || variants.neutral,
        className
      )}
      {...props}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  )
}
