import React, { useState } from 'react'
import {
  Cpu,
  ShoppingCart,
  Users,
  Layers,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Sparkles,
  ChevronRight,
  QrCode,
  Check,
  Clock
} from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { useAuth } from '@/contexts/AuthContext'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'

export function Dashboard() {
  const { user } = useAuth()
  const { clients, plates, sales, products } = useApp()
  const navigate = useNavigate()

  // Dynamic calculations
  const totalRevenue = sales.reduce((acc, curr) => acc + (curr.total || 0), 0)
  const totalProfit = sales.reduce((acc, curr) => acc + (curr.profit || 0), 0)
  const totalPlates = plates.length
  const activePlates = plates.filter(p => p.status === 'active').length
  const configuringPlates = plates.filter(p => p.status === 'configuring').length
  const inStockPlates = plates.filter(p => p.status === 'in_stock').length
  const progressPercent = totalPlates > 0 ? Math.round((activePlates / totalPlates) * 100) : 0

  // Interactive quick checklist for daily mobile operations
  const [completedTasks, setCompletedTasks] = useState({})

  const toggleTask = (taskId) => {
    setCompletedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }))
  }

  const tasks = [
    {
      id: 'task-1',
      title: 'Configurar URL Google Reviews',
      subtitle: 'Barbearia Don Corleone (NFC-000003)',
      time: 'Pendente',
      urgent: true,
      link: '/app/plates'
    },
    {
      id: 'task-2',
      title: 'Despachar Placa NFC Acrílico',
      subtitle: 'Auto Center Imperial (Venda #00051)',
      time: 'Hoje 14:00',
      urgent: false,
      link: '/app/sales'
    },
    {
      id: 'task-3',
      title: 'Repor estoque de displays balcão',
      subtitle: 'Estoque atual: 18 un (Mín: 20 un)',
      time: 'Alerta',
      urgent: true,
      link: '/app/inventory'
    }
  ]

  const categories = [
    {
      name: 'Placas NFC',
      count: `${plates.length} cad.`,
      icon: Cpu,
      color: 'text-primary bg-pastel-purple',
      path: '/app/plates'
    },
    {
      name: 'Nova Venda',
      count: 'Faturar',
      icon: ShoppingCart,
      color: 'text-amber-700 bg-pastel-orange',
      path: '/app/sales/new'
    },
    {
      name: 'Clientes',
      count: `${clients.length} ativ.`,
      icon: Users,
      color: 'text-emerald-700 bg-pastel-green',
      path: '/app/clients'
    },
    {
      name: 'Estoque',
      count: 'Movimentar',
      icon: Layers,
      color: 'text-sky-700 bg-pastel-blue',
      path: '/app/inventory'
    }
  ]

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-4">
      {/* Mobile Greeting (Inspired by Reference Screen 2) */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-mainText">
              Olá, {user?.name?.split(' ')[0] || 'Bruno'}
            </h1>
            <span className="text-xl">👋</span>
          </div>
          <p className="text-xs text-subText mt-0.5">
            Operação Craft NFC a todo vapor hoje!
          </p>
        </div>
      </div>

      {/* Hero Progress Card (Reference "Today's Progress" Gradient Card) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-[#6C5DFD] to-[#867BFF] p-5 sm:p-6 text-white shadow-glow">
        {/* Soft Background Accents */}
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute right-12 -bottom-10 w-28 h-28 rounded-full bg-white/10 blur-lg pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="space-y-1 sm:space-y-1.5 max-w-[65%]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/80 block">
              Meta de Ativações
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight">
                {progressPercent}%
              </span>
              <span className="text-xs text-white/90 font-medium">
                ({activePlates} de {totalPlates} placas)
              </span>
            </div>
            <p className="text-xs text-white/85 line-clamp-1 pt-0.5">
              Excelente ritmo! Mantenha a equipe configurando as URLs pendentes.
            </p>
          </div>

          {/* SVG Circular Progress Ring */}
          <div className="relative w-20 h-20 sm:w-22 sm:h-22 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
              <circle
                cx="36"
                cy="36"
                r="30"
                className="stroke-white/20"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="36"
                cy="36"
                r="30"
                className="stroke-white transition-all duration-700 ease-out"
                strokeWidth="6"
                strokeDasharray={188.5}
                strokeDashoffset={188.5 - (188.5 * progressPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Categories / Action Grid (Reference "Categories" Horizontal Badges) */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <h2 className="text-sm font-bold text-mainText font-heading">Acesso Rápido</h2>
          <button
            onClick={() => navigate('/app/plates')}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Ver catálogo
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <div
                key={cat.name}
                onClick={() => navigate(cat.path)}
                className="bg-white rounded-2xl p-3 border border-cardBorder shadow-sm flex flex-col items-center justify-center text-center transition-all duration-200 hover:scale-102 active:scale-95 cursor-pointer group"
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110 ${cat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-mainText block leading-tight">
                  {cat.name}
                </span>
                <span className="text-[10px] text-subText font-medium mt-0.5">
                  {cat.count}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Daily Operation Checklist (Reference "My Tasks" View) */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <h2 className="text-sm font-bold text-mainText font-heading">
            Atividades Prioritárias
          </h2>
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {Object.values(completedTasks).filter(Boolean).length} de {tasks.length} feitas
          </span>
        </div>

        <div className="space-y-2.5">
          {tasks.map((task) => {
            const isDone = completedTasks[task.id]
            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl p-3.5 border transition-all duration-200 flex items-center justify-between gap-3 shadow-card ${
                  isDone ? 'border-divider bg-gray-50/70 opacity-75' : 'border-cardBorder hover:border-primary/40'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                      isDone
                        ? 'bg-primary border-primary text-white'
                        : 'border-gray-300 hover:border-primary bg-white'
                    }`}
                  >
                    {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="overflow-hidden">
                    <p className={`text-xs font-bold text-mainText truncate ${isDone ? 'line-through text-subText' : ''}`}>
                      {task.title}
                    </p>
                    <p className="text-[11px] text-subText truncate mt-0.5">
                      {task.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    task.urgent
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-gray-100 text-subText'
                  }`}>
                    {task.time}
                  </span>
                  <button
                    onClick={() => navigate(task.link)}
                    className="p-1 text-subText hover:text-primary transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Compact KPIs Overview (Mobile Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="bg-white rounded-2xl p-3.5 border border-cardBorder shadow-sm">
          <p className="text-[11px] text-subText font-medium">Receita Mês</p>
          <p className="text-base font-bold font-heading text-mainText mt-1">
            R$ {totalRevenue.toFixed(0)}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold inline-flex items-center gap-0.5 mt-1">
            <TrendingUp className="w-3 h-3" /> +14.2%
          </span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-cardBorder shadow-sm">
          <p className="text-[11px] text-subText font-medium">Lucro Líquido</p>
          <p className="text-base font-bold font-heading text-mainText mt-1">
            R$ {totalProfit.toFixed(0)}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold inline-flex items-center gap-0.5 mt-1">
            Margem 72%
          </span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-cardBorder shadow-sm">
          <p className="text-[11px] text-subText font-medium">Placas Ativas</p>
          <p className="text-base font-bold font-heading text-primary mt-1">
            {activePlates} un.
          </p>
          <span className="text-[10px] text-subText font-medium mt-1 block">
            {configuringPlates} configurando
          </span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-cardBorder shadow-sm">
          <p className="text-[11px] text-subText font-medium">Estoque Físico</p>
          <p className="text-base font-bold font-heading text-mainText mt-1">
            {inStockPlates} un.
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
            Prontas para envio
          </span>
        </div>
      </div>
    </div>
  )
}
