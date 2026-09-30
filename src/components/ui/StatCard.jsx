import React from 'react'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

export function StatCard({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  description,
  className
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-card border border-cardBorder p-5 shadow-card flex flex-col justify-between transition-all hover:border-gray-300",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-subText uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold font-heading text-mainText mt-1.5 tracking-tight">{value}</h3>
        </div>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(change || description) && (
        <div className="mt-3.5 flex items-center gap-2 text-xs">
          {change && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded-md",
                isPositive ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
              )}
            >
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {change}
            </span>
          )}
          {description && (
            <span className="text-subText text-[11px] truncate">{description}</span>
          )}
        </div>
      )}
    </div>
  )
}
