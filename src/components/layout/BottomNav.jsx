import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home,
  Plus,
  Cpu,
  Users,
  Package
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const tabs = [
    { name: 'Início', path: '/app', icon: Home, exact: true },
    { name: 'Placas', path: '/app/plates', icon: Cpu },
    { name: 'Vender', path: '/app/sales/new', icon: Plus, isAction: true },
    { name: 'Estoque', path: '/app/inventory', icon: Package },
    { name: 'Clientes', path: '/app/clients', icon: Users },
  ]

  return (
    <nav className="mobile-bottom-nav">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon

          if (tab.isAction) {
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className="flex flex-col items-center justify-center -mt-6 transition-all duration-200 active:scale-95 group"
              >
                <div className="flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-[0_10px_25px_-5px_rgba(37,99,235,.5)] ring-4 ring-white transition-all">
                  <Icon className="w-6 h-6 stroke-[2.5]" />
                </div>
              </NavLink>
            )
          }

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.exact}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all min-w-[52px]",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-subText hover:text-mainText"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn("w-5 h-5 transition-transform", isActive ? "stroke-[2.3] scale-110" : "stroke-[1.8]")} />
                  <span className={cn("text-[10px] mt-1 tracking-tight transition-all", isActive ? "font-bold text-primary" : "text-subText")}>
                    {tab.name}
                  </span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
