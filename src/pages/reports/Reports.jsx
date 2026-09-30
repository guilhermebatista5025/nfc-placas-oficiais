import React, { useState } from 'react'
import {
  TrendingUp,
  DollarSign,
  ChevronDown,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  PieChart
} from 'lucide-react'
import { useApp } from '@/contexts/AppContext'

export function Reports() {
  const { sales, plates } = useApp()
  const [period, setPeriod] = useState('Esta Semana')

  const totalRevenue = sales.reduce((acc, curr) => acc + curr.total, 0)
  const totalCost = sales.reduce((acc, curr) => acc + curr.cost, 0)
  const totalProfit = totalRevenue - totalCost
  const margin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0
  const activePlatesCount = plates.filter(p => p.status === 'active').length

  // Days of week bar chart data
  const weeklyData = [
    { day: 'Seg', height: 45, value: 'R$ 280' },
    { day: 'Ter', height: 65, value: 'R$ 490' },
    { day: 'Qua', height: 90, value: 'R$ 820' },
    { day: 'Qui', height: 50, value: 'R$ 350' },
    { day: 'Sex', height: 100, value: 'R$ 1.100' },
    { day: 'Sáb', height: 75, value: 'R$ 620' },
    { day: 'Dom', height: 30, value: 'R$ 180' },
  ]

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-4">
      {/* Top Header & Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-mainText">Métricas & Estatísticas</h1>
          <p className="text-xs text-subText mt-0.5">Desempenho da operação de placas e vendas</p>
        </div>

        {/* Dropdown Pill (Reference "This Week ⌵") */}
        <div className="relative">
          <button className="flex items-center gap-1.5 bg-white border border-cardBorder px-3.5 py-1.5 rounded-full text-xs font-semibold text-mainText shadow-xs hover:bg-gray-50 transition-colors">
            <span>{period}</span>
            <ChevronDown className="w-3.5 h-3.5 text-subText" />
          </button>
        </div>
      </div>

      {/* Main Metric Card with Curved Trendline (Reference Screen 3 Top Card) */}
      <div className="bg-white rounded-3xl border border-cardBorder p-5 shadow-card space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-subText block">Faturamento Realizado</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold font-heading text-mainText tracking-tight">
                R$ {totalRevenue.toFixed(0)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+14.8% vs. semana anterior</span>
            </div>
          </div>

          <span className="bg-pastel-purple text-primary text-xs font-bold px-3 py-1 rounded-full shadow-xs">
            Meta Batida! 🎯
          </span>
        </div>

        {/* Curved Trendline Area Chart (Clean Responsive SVG) */}
        <div className="pt-2">
          <div className="h-32 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 350 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5B4DFB" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#5B4DFB" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area fill */}
              <path
                d="M 0,75 C 50,85 70,35 120,45 C 170,55 200,15 250,25 C 290,35 320,10 350,15 L 350,100 L 0,100 Z"
                fill="url(#purpleGradient)"
              />

              {/* Smooth curve stroke */}
              <path
                d="M 0,75 C 50,85 70,35 120,45 C 170,55 200,15 250,25 C 290,35 320,10 350,15"
                fill="none"
                stroke="#5B4DFB"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Interactive Key Dots */}
              <circle cx="120" cy="45" r="4.5" fill="#5B4DFB" stroke="#FFFFFF" strokeWidth="2.5" />
              <circle cx="250" cy="25" r="4.5" fill="#5B4DFB" stroke="#FFFFFF" strokeWidth="2.5" />
              <circle cx="350" cy="15" r="5" fill="#5B4DFB" stroke="#FFFFFF" strokeWidth="3" />
            </svg>
          </div>

          {/* Days axis */}
          <div className="flex justify-between text-[11px] font-medium text-subText mt-2 px-1">
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sáb</span>
            <span>Dom</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Radial Metas + Bar Chart (Reference Screen 3 Middle & Bottom) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card: Placas Concluídas & Ativadas com Radial Ring */}
        <div className="bg-white rounded-3xl border border-cardBorder p-5 shadow-card flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-subText">Placas Ativadas</span>
            <h3 className="text-2xl font-extrabold font-heading text-mainText mt-1">
              {activePlatesCount} <span className="text-xs text-subText font-normal">de {plates.length}</span>
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold inline-flex items-center gap-0.5 mt-1">
              <TrendingUp className="w-3 h-3" /> +8% este mês
            </span>
          </div>

          {/* Radial Purple Ring */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" className="stroke-gray-100" strokeWidth="5" fill="transparent" />
              <circle
                cx="25"
                cy="25"
                r="20"
                className="stroke-primary"
                strokeWidth="5"
                strokeDasharray={125.6}
                strokeDashoffset={125.6 - (125.6 * (activePlatesCount / Math.max(1, plates.length)))}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <CheckCircle2 className="w-5 h-5 text-primary absolute" />
          </div>
        </div>

        {/* Card: Ticket Médio & Margem */}
        <div className="bg-white rounded-3xl border border-cardBorder p-5 shadow-card flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-subText">Margem de Lucro Líquido</span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-extrabold font-heading text-mainText">{margin}%</h3>
              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                Alta Eficiência
              </span>
            </div>
            <p className="text-[11px] text-subText mt-1">
              Lucro projetado de R$ {totalProfit.toFixed(0)} após custos de produção.
            </p>
          </div>
        </div>
      </div>

      {/* Rounded Vertical Bars Chart (Reference Screen 3 Bottom Chart) */}
      <div className="bg-white rounded-3xl border border-cardBorder p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-mainText font-heading">
              Volume Diário de Vendas
            </h3>
            <span className="text-xs text-emerald-600 font-semibold inline-flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-3 h-3" /> +15% de engajamento diário
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-mainText bg-gray-100 px-2.5 py-1 rounded-full">
            Total 7 dias
          </span>
        </div>

        {/* Bars Container */}
        <div className="pt-4 flex items-end justify-between gap-2 h-36 px-2">
          {weeklyData.map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
              {/* Tooltip on hover */}
              <span className="text-[10px] font-mono font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                {item.value}
              </span>

              {/* Bar */}
              <div className="w-full max-w-[32px] bg-gray-100 rounded-full h-28 flex items-end overflow-hidden p-0.5">
                <div
                  className="w-full bg-gradient-to-t from-primary to-[#8C80FF] rounded-full transition-all duration-500 group-hover:brightness-110"
                  style={{ height: `${item.height}%` }}
                />
              </div>

              {/* Day label */}
              <span className="text-[11px] font-medium text-subText">
                {item.day}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
