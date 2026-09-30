import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home,
  BarChart2,
  Plus,
  Cpu,
  User,
  Menu
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav({ onOpenMore }) {
  const tabs = [
    { name: 'Início', path: '/app', icon: Home, exact: true },
    { name: 'Métricas', path: '/app/reports', icon: BarChart2 },
    { name: 'Vender', path: '/app/sales/new', icon: Plus, isAction: true },
    { name: 'Placas', path: '/app/plates', icon: Cpu },
    { name: 'Perfil', path: '/app/settings', icon: User },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-cardBorder/80 px-3 py-2 safe-area-pb shadow-mobile">
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
                <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-primary to-[#8174FF] text-white flex items-center justify-center shadow-glow ring-4 ring-white transition-all group-hover:shadow-lg">
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
