import React, { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Nfc as Contactless, ExternalLink, Link2, MapPin, MessageCircle, MoreVertical, Plus, ShieldCheck, Star, Wifi } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { EmptyMobile, MobileHeader, MobilePage, StatusPill } from '@/components/mobile/MobileUI'

const tabs = ['Visão geral', 'Placas', 'Vendas']

export function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { clients, plates, sales, credentials } = useApp()
  const [tab, setTab] = useState('Visão geral')
  const client = clients.find((item) => item.id === id) || clients[0]
  const clientPlates = useMemo(() => plates.filter((plate) => plate.client_id === client?.id), [plates, client])
  const clientSales = useMemo(() => sales.filter((sale) => sale.client_id === client?.id), [sales, client])
  const invested = clientSales.reduce((sum, sale) => sum + Number(sale.total || 0), 0)
  const money = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  if (!client) return <MobilePage><MobileHeader title="Cliente" back /><EmptyMobile>Cliente não encontrado.</EmptyMobile></MobilePage>

  return (
    <MobilePage>
      <MobileHeader title="Detalhes do cliente" back compact actions={<button className="mobile-icon-button" type="button" aria-label="Mais opções"><MoreVertical size={20} /></button>} />
      <section className="relative mt-2 overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 p-5 text-white shadow-[0_18px_36px_-16px_rgba(37,99,235,.65)]">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-400/20 blur-2xl" />
        <div className="relative">
          <div className="flex items-start gap-3"><div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 text-xl font-black ring-1 ring-white/20">{client.name.split(' ').slice(0, 2).map((part) => part[0]).join('')}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="truncate text-lg font-extrabold text-white">{client.name}</h2><span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" /></div><p className="mt-1 flex items-center gap-1 text-[11px] text-blue-100"><MapPin size={12} />{client.city} • {client.state}</p><p className="mt-1 text-[11px] text-blue-100/80">{client.business_segment}</p></div></div>
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/10 p-3 ring-1 ring-white/10"><div><span className="block text-[9px] font-bold uppercase text-blue-200">Responsável</span><strong className="text-xs">{client.responsible_name}</strong></div><a href={`https://wa.me/55${client.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-xl bg-emerald-400 px-3 py-2 text-[10px] font-extrabold text-emerald-950"><MessageCircle size={14} /> WhatsApp</a></div>
          <div className="mt-4 grid grid-cols-3 divide-x divide-white/15 rounded-2xl bg-slate-950/20 p-3 text-center"><div><strong className="block text-base">{clientPlates.length}</strong><span className="text-[9px] text-blue-200">Placas</span></div><div><strong className="block text-base">{money(invested)}</strong><span className="text-[9px] text-blue-200">Investido</span></div><div><strong className="flex items-center justify-center gap-1 text-base">4,9 <Star size={13} fill="currentColor" className="text-amber-300" /></strong><span className="text-[9px] text-blue-200">Avaliação</span></div></div>
        </div>
      </section>

      <div className="my-5 flex rounded-2xl bg-slate-200/60 p-1">{tabs.map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`flex-1 rounded-xl py-2.5 text-[10px] font-extrabold transition ${tab === item ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>{item}</button>)}</div>

      {(tab === 'Visão geral' || tab === 'Placas') && <section><div className="mb-3 flex items-center justify-between"><div><h2 className="text-sm font-extrabold text-slate-900">Dispositivos vinculados</h2><p className="text-[10px] text-slate-400">Sincronização em tempo real</p></div><StatusPill tone="green"><Wifi size={11} className="mr-1" /> Online</StatusPill></div><div className="space-y-3">{clientPlates.length ? clientPlates.map((plate, index) => <article key={plate.id} className="mobile-card p-4"><div className="flex items-start gap-3"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${index % 2 ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}><Contactless size={22} /></span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><strong className="truncate text-xs text-slate-900">{plate.product_name}</strong><StatusPill tone={plate.status === 'active' ? 'green' : 'amber'}>{plate.status === 'active' ? 'Ativa' : 'Configurando'}</StatusPill></div><p className="mt-1 font-mono text-[10px] text-slate-400">{plate.code} • {plate.serial_number}</p></div></div><div className="mt-3 rounded-2xl bg-slate-50 p-3"><p className="truncate text-[10px] font-semibold text-slate-500">{plate.google_review_url || 'URL do Google ainda não vinculada'}</p><div className="mt-3 flex gap-2"><button type="button" className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-white py-2 text-[10px] font-bold text-slate-600 ring-1 ring-slate-200"><Link2 size={13} /> Copiar link</button><button type="button" onClick={() => navigate('/app/plates')} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-blue-600 py-2 text-[10px] font-bold text-white"><ExternalLink size={13} /> Gerenciar</button></div></div></article>) : <EmptyMobile>Nenhuma placa vinculada.</EmptyMobile>}</div></section>}

      {tab === 'Vendas' && <div className="space-y-3">{clientSales.length ? clientSales.map((sale) => <article key={sale.id} className="mobile-card flex items-center justify-between p-4"><div><strong className="text-xs">Venda #{sale.number}</strong><p className="mt-1 text-[10px] text-slate-400">{sale.sale_date} • {sale.payment_method}</p></div><strong className="text-sm text-emerald-600">{money(sale.total)}</strong></article>) : <EmptyMobile>Nenhuma venda para este cliente.</EmptyMobile>}</div>}

      {tab === 'Visão geral' && <section className="mt-4 mobile-card flex items-center gap-3 p-4"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><ShieldCheck size={20} /></span><div className="min-w-0 flex-1"><strong className="block text-xs">Credenciais protegidas</strong><p className="truncate text-[10px] text-slate-400">{credentials.filter((item) => item.client_id === client.id).length} integração(ões) configurada(s)</p></div></section>}

      <button type="button" onClick={() => navigate('/app/sales/new')} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-blue-200"><Plus size={17} /> Nova venda para este cliente</button>
    </MobilePage>
  )
}
