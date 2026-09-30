import React, { useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Bell, CalendarDays, PackagePlus, RefreshCw, Search, ShieldCheck, Undo2, X } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'

const filters = [{ key: 'all', label: 'Todas' }, { key: 'entry', label: 'Entradas' }, { key: 'exit', label: 'Saídas' }, { key: 'adjustment', label: 'Ajustes' }, { key: 'return', label: 'Devoluções' }]

export function InventoryMovementsSheet({ open, onClose }) {
  const { inventoryMovements, products } = useApp()
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const visible = useMemo(() => inventoryMovements.filter((movement) => (filter === 'all' || movement.type === filter) && `${movement.product_name} ${movement.reason}`.toLowerCase().includes(query.toLowerCase())), [inventoryMovements, filter, query])
  const entries = inventoryMovements.filter((item) => item.quantity > 0).reduce((sum, item) => sum + item.quantity, 0)
  const exits = Math.abs(inventoryMovements.filter((item) => item.quantity < 0).reduce((sum, item) => sum + item.quantity, 0))
  const stock = products.filter((item) => item.id === 'prod-01' || item.id === 'prod-02').reduce((sum, item) => sum + Number(item.current_stock || 0), 0)
  const iconFor = (type) => ({ entry: ArrowDownLeft, exit: ArrowUpRight, adjustment: RefreshCw, return: Undo2 }[type] || Bell)
  const toneFor = (type) => ({ entry: 'bg-emerald-50 text-emerald-600', exit: 'bg-blue-50 text-blue-600', adjustment: 'bg-amber-50 text-amber-600', return: 'bg-violet-50 text-violet-600' }[type] || 'bg-slate-100 text-slate-600')

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] flex items-end bg-slate-950/45 backdrop-blur-sm" onClick={onClose}>
      <section className="mx-auto flex max-h-[91dvh] w-full max-w-[480px] flex-col overflow-hidden rounded-t-[32px] bg-[#F5F7FB] shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex justify-center py-2"><span className="h-1.5 w-12 rounded-full bg-slate-300" /></div>
        <header className="flex items-center justify-between px-5 pb-4"><div><p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Estoque em tempo real</p><h2 className="text-lg font-extrabold text-slate-900">Movimentações</h2></div><button type="button" onClick={onClose} className="mobile-icon-button"><X size={18} /></button></header>
        <div className="overflow-y-auto px-5 pb-7">
          <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 p-5 text-white shadow-lg shadow-blue-200"><div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" /><div className="relative"><p className="text-[9px] font-bold uppercase tracking-wider text-blue-200">Saldo disponível</p><div className="mt-1 flex items-end gap-2"><strong className="text-3xl text-white">{stock}</strong><span className="pb-1 text-xs font-bold text-blue-100">unidades</span></div><div className="mt-4 grid grid-cols-3 rounded-2xl bg-black/15 p-3 text-center"><div><span className="block text-[9px] text-blue-200">Entradas</span><strong className="text-xs text-emerald-300">+{entries}</strong></div><div><span className="block text-[9px] text-blue-200">Saídas</span><strong className="text-xs text-rose-300">-{exits}</strong></div><div><span className="block text-[9px] text-blue-200">Registros</span><strong className="text-xs">{inventoryMovements.length}</strong></div></div></div></div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">{filters.map((item) => <button key={item.key} type="button" onClick={() => setFilter(item.key)} className={`shrink-0 rounded-full px-3.5 py-2 text-[9px] font-extrabold ${filter === item.key ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 shadow-sm'}`}>{item.label}</button>)}</div>
          <div className="relative mt-3"><Search size={16} className="absolute left-3 top-3 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar movimentação..." className="w-full rounded-2xl border border-slate-100 bg-white py-3 pl-9 pr-3 text-xs outline-none" /></div>
          <div className="mb-3 mt-5 flex items-center justify-between"><h3 className="text-sm font-extrabold">Atividade recente</h3><span className="flex items-center gap-1 text-[9px] font-bold text-slate-400"><CalendarDays size={12} /> {visible.length} registros</span></div>
          <div className="space-y-3">{visible.map((movement) => { const Icon = iconFor(movement.type); const positive = movement.quantity > 0; return <article key={movement.id} className="mobile-card flex items-start gap-3 p-4"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${toneFor(movement.type)}`}><Icon size={20} /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><strong className="truncate text-[11px] text-slate-900">{movement.product_name}</strong><strong className={`shrink-0 text-xs ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>{positive ? '+' : ''}{movement.quantity} un</strong></div><p className="mt-1 text-[9px] leading-relaxed text-slate-500">{movement.reason}</p><div className="mt-2 flex items-center justify-between text-[8px] font-semibold text-slate-400"><span>{movement.author || 'Sistema'}</span><span>{movement.created_at}</span></div></div></article> })}</div>
          {!visible.length && <div className="mt-4 rounded-3xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">Nenhuma movimentação encontrada.</div>}
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-blue-50 p-4"><ShieldCheck size={20} className="shrink-0 text-blue-600" /><div><strong className="block text-[10px] text-blue-900">Histórico protegido</strong><p className="text-[8px] text-blue-600">Cada movimentação mantém data, responsável e origem.</p></div></div>
          <button type="button" onClick={() => { onClose(); window.location.href = '/app/inventory' }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-xs font-extrabold text-white"><PackagePlus size={17} /> Cadastrar entrada em lote</button>
        </div>
      </section>
    </div>
  )
}
