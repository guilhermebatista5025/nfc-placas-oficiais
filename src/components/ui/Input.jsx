import React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef(({
  className,
  label,
  error,
  icon: Icon,
  type = 'text',
  ...props
}, ref) => {
  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label className="block text-xs font-semibold text-mainText tracking-wide">
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-subText">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            "w-full rounded-xl border border-divider bg-white px-3.5 py-2.5 text-sm text-mainText placeholder-subText/70 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
            Icon && "pl-10",
            error && "border-danger focus:border-danger focus:ring-danger",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-danger font-medium mt-1">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'
