import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Cpu,
  Layers,
  KeyRound,
  BarChart3,
  UserCheck,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useApp } from '@/contexts/AppContext'

const navItems = [
  { name: 'Dashboard', path: '/app', icon: LayoutDashboard },
  { name: 'Clientes', path: '/app/clients', icon: Users },
  { name: 'Vendas', path: '/app/sales', icon: ShoppingCart },
  { name: 'Produtos', path: '/app/products', icon: Package },
  { name: 'Placas NFC', path: '/app/plates', icon: Cpu },
  { name: 'Estoque', path: '/app/inventory', icon: Layers },
  { name: 'Credenciais', path: '/app/credentials', icon: KeyRound },
  { name: 'Relatórios', path: '/app/reports', icon: BarChart3 },
  { name: 'Equipe', path: '/app/team', icon: UserCheck },
  { name: 'Assinatura', path: '/app/billing', icon: CreditCard },
  { name: 'Configurações', path: '/app/settings', icon: Settings },
]

export function Sidebar({ collapsed, setCollapsed, isMobile, closeMobile }) {
  const { user } = useAuth()
  const { organization } = useApp()

  return (
    <aside
      className={cn(
        "bg-white border-r border-cardBorder h-full flex flex-col justify-between transition-all duration-200 z-30 select-none",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Top Header / Brand */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-divider">
          {!collapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold font-heading text-lg shadow-sm">
                C
              </div>
              <div className="leading-tight truncate">
                <span className="font-heading font-bold text-sm tracking-tight text-mainText block">
                  Craft NFC
                </span>
                <span className="text-[10px] uppercase font-semibold text-primary tracking-wider">
                  Manager SaaS
                </span>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="mx-auto h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold font-heading text-lg shadow-sm">
              C
            </div>
          )}

          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-lg hover:bg-gray-100 text-subText hover:text-mainText transition-colors"
              title={collapsed ? "Expandir menu" : "Recolher menu"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Organization Info banner */}
        {!collapsed && (
          <div className="mx-3 mt-3 p-2.5 bg-[#F8FAFC] rounded-xl border border-cardBorder flex items-center justify-between">
            <div className="truncate">
              <p className="text-xs font-semibold text-mainText truncate">{organization?.name || 'Craft Evolution'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <p className="text-[11px] text-subText font-medium">{organization?.plan || 'Plano Pro'}</p>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          </div>
        )}

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/app'}
                onClick={isMobile ? closeMobile : undefined}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-subText hover:text-mainText hover:bg-gray-50",
                    collapsed && "justify-center px-0"
                  )
                }
                title={collapsed ? item.name : undefined}
              >
                <Icon className={cn("w-5 h-5 shrink-0", collapsed ? "w-5 h-5" : "")} />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Bottom User Area */}
      <div className="p-3 border-t border-divider">
        <div className={cn("flex items-center gap-2.5 p-2 rounded-xl", collapsed && "justify-center p-0")}>
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-primary font-bold text-xs flex items-center justify-center">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          </div>

          {!collapsed && (
            <div className="overflow-hidden leading-tight text-left">
              <p className="text-xs font-semibold text-mainText truncate">{user?.name || 'Administrador'}</p>
              <p className="text-[11px] text-subText capitalize font-medium">{user?.role || 'Owner'}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
