import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CirclePlus, Nfc as Contactless, Eye, EyeOff, Package as Inventory, MoreHorizontal, TrendingUp, TriangleAlert, Utensils, Scissors, Car, ArrowRight } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { useAuth } from '@/contexts/AuthContext'
import { MobileHeader, MobilePage, SectionTitle, StatusPill } from '@/components/mobile/MobileUI'
import { InventoryMovementsSheet } from '@/components/mobile/InventoryMovementsSheet'

const saleIcons = [Utensils, Scissors, Car]

export function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { sales, plates, products } = useApp()
  const [showRevenue, setShowRevenue] = useState(true)
  const [movementsOpen, setMovementsOpen] = useState(false)
  const metrics = useMemo(() => {
    const revenue = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0)
    const profit = sales.reduce((sum, sale) => sum + Number(sale.profit || 0), 0)
    return {
      revenue,
      profit,
      active: plates.filter((plate) => plate.status === 'active').length,
      stock: plates.filter((plate) => plate.status === 'in_stock').length,
      pending: plates.filter((plate) => !plate.google_review_url).length,
      totalStock: products.reduce((sum, product) => sum + Number(product.current_stock || 0), 0),
    }
  }, [sales, plates, products])
  const money = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const actions = [
    { label: 'Gravar tag', icon: Contactless, color: 'text-blue-600', path: '/app/plates' },
    { label: 'Nova venda', icon: CirclePlus, color: 'text-emerald-600', path: '/app/sales/new' },
    { label: 'Estoque', icon: Inventory, color: 'text-indigo-600', path: '/app/inventory' },
    { label: 'Mais', icon: MoreHorizontal, color: 'text-slate-600', path: '/app/clients' },
  ]

  return (
    <MobilePage>
      <MobileHeader title="Craft Evolution" subtitle={`Olá, ${user?.name?.split(' ')[0] || 'Alex'}`} onNotifications={() => setMovementsOpen(true)} />
      <section role="button" tabIndex={0} onClick={() => navigate('/app/finance')} onKeyDown={(event) => event.key === 'Enter' && navigate('/app/finance')} className="relative mt-2 cursor-pointer overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-800 p-6 text-white shadow-[0_16px_35px_-12px_rgba(37,99,235,.6)]">
        <div className="absolute -right-12 -bottom-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><span className="text-[11px] font-bold uppercase tracking-wider text-blue-100">Receita bruta total</span><span className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[10px] font-bold"><TrendingUp size={12} />14,2%</span></div>
            <button type="button" onClick={(event) => { event.stopPropagation(); setShowRevenue((value) => !value) }} aria-label="Alternar valor" className="rounded-full bg-white/15 p-2">{showRevenue ? <Eye size={16} /> : <EyeOff size={16} />}</button>
          </div>
          <p className="mt-2 text-[30px] font-black tracking-tight">{showRevenue ? money(metrics.revenue) : 'R$ ••••••'}</p>
          <div className="mt-5 grid grid-cols-2 border-t border-white/15 pt-4">
            <div><p className="text-[10px] font-semibold uppercase text-blue-200">Lucro líquido</p><strong className="mt-1 block text-sm">{money(metrics.profit)}</strong></div>
            <div className="text-right"><p className="text-[10px] font-semibold uppercase text-blue-200">Hardware online</p><strong className="mt-1 flex items-center justify-end gap-1 text-sm text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />{metrics.active} unidades</strong></div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-blue-100/80"><span>•••• 4832</span><span className="rounded bg-white/15 px-2 py-1">NFC PRO</span></div>
        </div>
      </section>

      <div className="my-5 grid grid-cols-4 gap-2">
        {actions.map(({ label, icon: Icon, color, path }) => <button key={label} type="button" onClick={() => navigate(path)} className="flex min-w-0 flex-col items-center gap-2 active:scale-95"><span className={`grid h-14 w-14 place-items-center rounded-2xl border border-slate-100 bg-white shadow-sm ${color}`}><Icon size={23} /></span><span className="w-full truncate text-[10px] font-bold text-slate-600">{label}</span></button>)}
      </div>

      {metrics.pending > 0 && <button type="button" onClick={() => navigate('/app/plates')} className="mb-5 flex w-full items-center gap-3 rounded-2xl border border-amber-100 bg-white p-4 text-left shadow-sm"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-500"><TriangleAlert size={21} /></span><span className="min-w-0 flex-1"><strong className="block text-xs text-slate-900">{metrics.pending} placas sem URL</strong><small className="block truncate text-[10px] text-slate-400">Pendente vincular Google Reviews</small></span><span className="flex items-center gap-1 rounded-xl bg-amber-500 px-3 py-2 text-[10px] font-bold text-white">Vincular <ArrowRight size={13} /></span></button>}

      <section className="mobile-card mb-5 p-5">
        <SectionTitle title="Ciclo de hardware" detail={`Distribuição de ${plates.length} tags NFC`} action="Relatório" onAction={() => navigate('/app/reports')} />
        <div className="flex items-center gap-5">
          <div className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full" style={{ background: 'conic-gradient(#2563eb 0 69%, #38bdf8 69% 88%, #f59e0b 88% 95%, #e2e8f0 95%)' }}><div className="grid h-20 w-20 place-items-center rounded-full bg-white text-center"><div><strong className="block text-lg text-slate-900">{plates.length}</strong><span className="text-[9px] font-bold uppercase text-slate-400">Total</span></div></div></div>
          <div className="flex-1 space-y-2.5 text-xs">{[['Ativas', metrics.active, 'bg-blue-600'], ['Em estoque', metrics.stock, 'bg-sky-400'], ['Reservadas', plates.filter((p) => p.status === 'reserved').length, 'bg-amber-500'], ['Configurando', plates.filter((p) => p.status === 'configuring').length, 'bg-slate-300']].map(([label, value, color]) => <div key={label} className="flex items-center justify-between"><span className="flex items-center gap-2 font-medium text-slate-500"><i className={`h-2 w-2 rounded-full ${color}`} />{label}</span><strong>{value}</strong></div>)}</div>
        </div>
      </section>

      <SectionTitle title="Últimas vendas" action="Ver todas" onAction={() => navigate('/app/sales')} />
      <div className="space-y-2.5">
        {sales.slice(0, 3).map((sale, index) => { const Icon = saleIcons[index % saleIcons.length]; return <button key={sale.id} type="button" onClick={() => navigate('/app/sales')} className="mobile-card flex w-full items-center gap-3 p-4 text-left"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600"><Icon size={20} /></span><span className="min-w-0 flex-1"><strong className="block truncate text-xs text-slate-900">{sale.client_name}</strong><small className="block truncate text-[10px] text-slate-400">{sale.items_count} item(ns) • {sale.channel}</small></span><span className="text-right"><strong className="block text-xs text-emerald-600">+ {money(sale.total)}</strong><StatusPill tone={sale.payment_status === 'paid' ? 'green' : 'amber'}>{sale.payment_status === 'paid' ? 'Pago' : 'Pendente'}</StatusPill></span></button> })}
      </div>
      <div className="mt-4 rounded-2xl bg-slate-900 p-4 text-white"><p className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Estoque conectado</p><div className="mt-1 flex items-end justify-between"><strong className="text-xl">{metrics.totalStock} unidades</strong><button type="button" onClick={() => navigate('/app/inventory')} className="text-xs font-bold text-blue-300">Gerenciar →</button></div></div>
      <InventoryMovementsSheet open={movementsOpen} onClose={() => setMovementsOpen(false)} />
    </MobilePage>
  )
}
