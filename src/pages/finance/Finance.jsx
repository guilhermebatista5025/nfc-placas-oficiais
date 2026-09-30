import React, { useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, CreditCard, Download, Eye, EyeOff, Nfc, ReceiptText, Search, TrendingUp, Users, WalletCards, Zap } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { MobileHeader, MobilePage, StatusPill } from '@/components/mobile/MobileUI'

const team = [
  { name: 'Bruno Oliveira', initials: 'BO', rate: 7, share: .58, paid: true, color: 'bg-blue-600' },
  { name: 'Mariana Souza', initials: 'MS', rate: 6, share: .27, paid: false, color: 'bg-indigo-500' },
  { name: 'Carlos Mendes', initials: 'CM', rate: 5, share: .15, paid: false, color: 'bg-slate-500' },
]
const tabs = ['Extrato geral', 'Comissões', 'Custos hardware']

export function Finance() {
  const { sales } = useApp()
  const [showBalance, setShowBalance] = useState(true)
  const [tab, setTab] = useState('Extrato geral')
  const [query, setQuery] = useState('')
  const metrics = useMemo(() => {
    const revenue = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0)
    const hardware = sales.reduce((sum, sale) => sum + Number(sale.cost || 0), 0)
    const commissions = revenue * .06
    return { revenue, hardware, commissions, net: revenue - hardware - commissions }
  }, [sales])
  const visibleSales = sales.filter((sale) => `${sale.number} ${sale.client_name} ${sale.payment_method}`.toLowerCase().includes(query.toLowerCase()))
  const money = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const goal = 20000
  const progress = Math.min(100, (metrics.revenue / goal) * 100)

  return (
    <MobilePage>
      <MobileHeader title="Extrato geral" subtitle="Extrato & finanças" back compact actions={<button type="button" className="mobile-icon-button" aria-label="Exportar"><Download size={18} /></button>} />
      <div className="mt-2 flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-[9px] font-bold text-blue-700"><CalendarDays size={14} /><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Fechamento do período atual</div>

      <section className="relative mt-4 overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 p-5 text-white shadow-xl shadow-blue-200">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="relative"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-[9px] font-bold uppercase tracking-wider text-blue-100">Lucro líquido disponível</span><button type="button" onClick={() => setShowBalance((value) => !value)}>{showBalance ? <Eye size={15} /> : <EyeOff size={15} />}</button></div><span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-bold"><TrendingUp size={12} /> +18,4%</span></div><div className="mt-2 text-[29px] font-black tracking-tight">{showBalance ? money(metrics.net) : 'R$ ••••••'}</div><div className="mt-4 grid grid-cols-3 gap-2">{[['Receita bruta', metrics.revenue], ['Hardware', metrics.hardware], ['Comissões', metrics.commissions]].map(([label, value]) => <div key={label} className="rounded-2xl bg-white/10 p-2.5"><span className="block truncate text-[8px] text-blue-100">{label}</span><strong className="mt-1 block truncate text-[10px] text-white">{showBalance ? money(value) : '••••'}</strong></div>)}</div><div className="mt-4"><div className="mb-2 flex justify-between text-[9px] font-bold text-blue-100"><span>Meta {money(goal)}</span><span>{progress.toFixed(0)}% atingida</span></div><div className="h-2 rounded-full bg-black/20"><div className="h-2 rounded-full bg-white transition-all" style={{ width: `${progress}%` }} /></div></div></div>
      </section>

      <div className="my-4 flex rounded-2xl bg-slate-200/60 p-1">{tabs.map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`flex-1 rounded-xl px-1 py-2.5 text-[9px] font-extrabold ${tab === item ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>{item}</button>)}</div>

      {(tab === 'Extrato geral' || tab === 'Comissões') && <section className="mobile-card p-4"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 text-blue-600"><Users size={17} /></span><h2 className="text-sm font-extrabold">Comissões da equipe</h2></div><span className="text-[9px] font-bold text-slate-400">{money(metrics.commissions)}</span></div><div className="space-y-2">{team.map((member) => { const value = metrics.commissions * member.share; return <div key={member.name} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-[10px] font-extrabold text-white ${member.color}`}>{member.initials}</span><div className="min-w-0 flex-1"><strong className="block truncate text-[10px]">{member.name}</strong><span className="text-[8px] text-slate-400">Taxa {member.rate}%</span></div><div className="text-right"><strong className="block text-[10px]">{money(value)}</strong><StatusPill tone={member.paid ? 'green' : 'slate'}>{member.paid ? 'Pago' : 'Pendente'}</StatusPill></div></div> })}</div><button type="button" className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 py-3 text-[10px] font-extrabold text-blue-700"><Zap size={15} /> Pagar comissões via Pix</button></section>}

      {tab === 'Custos hardware' && <section className="mobile-card p-4"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-rose-50 text-rose-600"><Nfc size={21} /></span><div><span className="text-[9px] font-bold uppercase text-slate-400">Custo total vendido</span><strong className="block text-lg">{money(metrics.hardware)}</strong></div></div><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-slate-50 p-3"><span className="text-[8px] text-slate-400">Custo médio/venda</span><strong className="mt-1 block text-xs">{money(metrics.hardware / Math.max(1, sales.length))}</strong></div><div className="rounded-2xl bg-emerald-50 p-3"><span className="text-[8px] text-emerald-600">Margem operacional</span><strong className="mt-1 block text-xs text-emerald-700">{metrics.revenue ? ((metrics.revenue - metrics.hardware) / metrics.revenue * 100).toFixed(1) : 0}%</strong></div></div></section>}

      {tab === 'Extrato geral' && <><div className="relative mt-4"><Search size={16} className="absolute left-3 top-3.5 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar transação ou cliente..." className="w-full rounded-2xl border border-slate-100 bg-white py-3.5 pl-10 pr-3 text-xs outline-none shadow-sm" /></div><div className="mb-3 mt-5 flex items-center justify-between"><h2 className="text-sm font-extrabold">Movimentações financeiras</h2><span className="text-[9px] font-bold text-emerald-600">+{money(metrics.revenue)}</span></div><div className="space-y-3">{visibleSales.map((sale, index) => { const commission = Number(sale.total) * .06; const net = Number(sale.total) - Number(sale.cost || 0) - commission; return <article key={sale.id} className="mobile-card p-4"><div className="flex items-start gap-3"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${index % 2 ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>{sale.payment_method?.toLowerCase().includes('cartão') ? <CreditCard size={20} /> : <WalletCards size={20} />}</span><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><strong className="truncate text-[10px]">Venda #{sale.number} • {sale.client_name}</strong><strong className="shrink-0 text-xs text-emerald-600">+{money(sale.total)}</strong></div><p className="mt-1 text-[8px] text-slate-400">{sale.items_count} item(ns) • {sale.payment_method} • {sale.sale_date}</p></div></div><div className="mt-3 rounded-2xl bg-slate-50 p-3 text-[9px]"><div className="flex justify-between text-slate-500"><span>Hardware: <b className="text-slate-700">-{money(sale.cost)}</b></span><span>Comissão: <b className="text-slate-700">-{money(commission)}</b></span></div><div className="mt-2 flex justify-between border-t border-slate-200 pt-2"><strong>Lucro líquido real</strong><strong className="text-emerald-600">+{money(net)}</strong></div></div><div className="mt-2 flex items-center justify-between"><StatusPill tone="green"><CheckCircle2 size={10} className="mr-1" /> Recebido</StatusPill><ReceiptText size={15} className="text-slate-300" /></div></article> })}</div></>}
      <div className="mt-5 rounded-3xl bg-slate-900 p-5 text-white"><p className="text-[9px] font-bold uppercase text-blue-300">Desempenho operacional</p><div className="mt-3 grid grid-cols-3 text-center"><div><strong className="block text-sm text-white">{money(metrics.revenue)}</strong><span className="text-[8px] text-slate-400">Receita</span></div><div><strong className="block text-sm text-white">{money(metrics.hardware + metrics.commissions)}</strong><span className="text-[8px] text-slate-400">Custos</span></div><div><strong className="block text-sm text-emerald-300">{money(metrics.net)}</strong><span className="text-[8px] text-slate-400">Líquido</span></div></div></div>
    </MobilePage>
  )
}
