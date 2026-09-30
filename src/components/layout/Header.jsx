import React, { useState } from 'react'
import {
  Search,
  Bell,
  Menu,
  LogOut,
  Building2,
  ExternalLink,
  Plus
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useApp } from '@/contexts/AppContext'
import { useNavigate } from 'react-router-dom'

export function Header({ onOpenMobileMenu }) {
  const { user, logout } = useAuth()
  const { organization, searchQuery, setSearchQuery } = useApp()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const notifications = [
    { id: 1, title: 'Estoque baixo', desc: 'Display de Balcão NFC atingiu 18 unidades.', time: 'Há 10 min', unread: true },
    { id: 2, title: 'Nova ativação de placa', desc: 'NFC-000002 ativada para Villa Gourmet.', time: 'Há 1 hora', unread: true },
    { id: 3, title: 'Placa aguardando configuração', desc: 'NFC-000003 precisa da URL do Google Reviews.', time: 'Há 2 horas', unread: false },
  ]

  return (
    <header className="h-16 bg-white border-b border-cardBorder px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Menu Toggle + Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-subText hover:text-mainText hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-subText">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar clientes, placas (NFC-000001), vendas..."
            className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-divider rounded-xl text-xs sm:text-sm text-mainText placeholder-subText/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-subText hover:text-mainText"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Action Button */}
        <button
          onClick={() => navigate('/app/sales/new')}
          className="hidden sm:inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nova Venda
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowUserMenu(false)
            }}
            className="p-2 rounded-xl text-subText hover:text-mainText hover:bg-gray-100 relative transition-colors"
            title="Notificações"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-cardBorder p-4 z-50 animate-in fade-in-0 zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-divider">
                <span className="font-semibold text-xs text-mainText">Notificações da Operação</span>
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">2 novas</span>
              </div>
              <div className="divide-y divide-divider/60 mt-1 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2.5 hover:bg-gray-50/80 px-2 rounded-lg transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-mainText">{n.title}</p>
                      <span className="text-[10px] text-subText">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-subText mt-0.5">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Organization / Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu)
              setShowNotifications(false)
            }}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-left text-xs">
              <span className="font-medium text-mainText block leading-tight">{user?.name || 'Bruno'}</span>
              <span className="text-[10px] text-subText">{organization?.name || 'Craft Evolution'}</span>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-cardBorder p-2 z-50 animate-in fade-in-0 zoom-in-95">
              <div className="px-3 py-2 border-b border-divider">
                <p className="text-xs font-semibold text-mainText truncate">{user?.name}</p>
                <p className="text-[11px] text-subText truncate">{user?.email}</p>
                <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  <Building2 className="w-3 h-3" />
                  {organization?.name}
                </div>
              </div>
              <div className="p-1 space-y-0.5">
                <button
                  onClick={() => {
                    navigate('/app/settings')
                    setShowUserMenu(false)
                  }}
                  className="w-full text-left text-xs text-subText hover:text-mainText hover:bg-gray-50 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  Configurações da Conta
                </button>
                <button
                  onClick={() => {
                    navigate('/app/billing')
                    setShowUserMenu(false)
                  }}
                  className="w-full text-left text-xs text-subText hover:text-mainText hover:bg-gray-50 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  Plano e Assinatura
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-xs text-danger hover:bg-rose-50 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sair do sistema
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
