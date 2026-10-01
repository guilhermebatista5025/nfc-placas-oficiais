import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Download, Eye, EyeOff, Filter, Map, MessageCircle, MoreVertical, Nfc, Plus, Search, Star, TrendingUp, UserPlus, Users, WalletCards, X } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { MobileHeader, MobilePage, StatusPill } from '@/components/mobile/MobileUI'

const segmentFilters = [
  { key: 'all', label: 'Todos' },
  { key: 'gastronomia', label: 'Gastronomia' },
  { key: 'beleza', label: 'Saúde & estética' },
  { key: 'automotivo', label: 'Automotivo' },
]

const emptyForm = { name: '', responsible_name: '', email: '', phone: '', document: '', business_segment: '', city: '', state: 'ES', address: '', notes: '' }

export function Clients() {
  const navigate = useNavigate()
  const { clients, plates, sales, addClient } = useApp()
  const [showMetrics, setShowMetrics] = useState(true)
  const [query, setQuery] = useState('')
  const [segment, setSegment] = useState('all')
  const [status, setStatus] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const activePlates = plates.filter((plate) => plate.status === 'active').length
  const totalInvested = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0)
  const money = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

  const enrichedClients = useMemo(() => clients.map((client, index) => {
    const clientPlates = plates.filter((plate) => plate.client_id === client.id)
    const clientSales = sales.filter((sale) => sale.client_id === client.id)
    const pending = clientPlates.some((plate) => !plate.google_review_url || plate.status === 'configuring')
    return { ...client, clientPlates, activeCount: clientPlates.filter((plate) => plate.status === 'active').length, invested: clientSales.reduce((sum, sale) => sum + Number(sale.total || 0), 0), pending, rating: (4.7 + (index % 3) * .1).toFixed(1), taps: 115 + index * 93 }
  }), [clients, plates, sales])

  const visibleClients = enrichedClients.filter((client) => {
    const haystack = `${client.name} ${client.responsible_name} ${client.document} ${client.city} ${client.business_segment}`.toLowerCase()
    const segmentMatch = segment === 'all' || (segment === 'beleza' ? /beleza|estética|saúde/i.test(client.business_segment) : client.business_segment.toLowerCase().includes(segment))
    const statusMatch = status === 'all' || (status === 'active' ? client.activeCount > 0 && !client.pending : client.pending || client.activeCount === 0)
    return haystack.includes(query.toLowerCase()) && segmentMatch && statusMatch
  })

  const submitClient = async (event) => {
    event.preventDefault()
    if (!form.name.trim()) return
    try {
      const client = await addClient({ ...form, business_segment: form.business_segment || 'Comércio Geral', city: form.city || 'Vila Velha' })
      setSaved(true)
      setTimeout(() => { setFormOpen(false); setSaved(false); setForm(emptyForm); navigate(`/app/clients/${client.id}`) }, 700)
    } catch (error) {
      window.alert(error.message || 'Não foi possível cadastrar o cliente.')
    }
  }
  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const exportClients = () => {
    const rows = [['Cliente', 'Responsável', 'Telefone', 'Cidade', 'Segmento'], ...clients.map((client) => [client.name, client.responsible_name, client.phone, client.city, client.business_segment])]
    const csv = rows.map((row) => row.map((value) => `"${String(value || '').replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a'); link.href = url; link.download = 'clientes-craft.csv'; link.click(); URL.revokeObjectURL(url)
  }

  const actions = [
    { label: 'Novo cliente', icon: UserPlus, color: 'bg-blue-600 text-white shadow-blue-200', action: () => setFormOpen(true) },
    { label: 'Massa Zap', icon: MessageCircle, color: 'bg-emerald-50 text-emerald-600', action: () => window.open('https://web.whatsapp.com', '_blank') },
    { label: 'Ver no mapa', icon: Map, color: 'bg-indigo-50 text-indigo-600', action: () => window.open('https://www.google.com/maps', '_blank') },
    { label: 'Exportar', icon: Download, color: 'bg-slate-100 text-slate-600', action: exportClients },
  ]

  return (
    <MobilePage>
      <MobileHeader title="Clientes" subtitle="Craft Evolution" />
      <section className="relative mt-2 overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 p-5 text-white shadow-xl shadow-blue-200">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" /><div className="relative"><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-blue-100"><span className="grid h-6 w-6 place-items-center rounded-full bg-white/15"><Check size={13} /></span>Base de clientes ativa</span><StatusPill tone="green">98,5% retenção</StatusPill></div><div className="mt-4 flex items-center justify-between"><div><div className="flex items-end gap-2"><strong className="text-4xl text-white">{showMetrics ? clients.length : '••'}</strong><span className="pb-1 text-xs font-semibold text-blue-100">estabelecimentos</span></div><p className="mt-1 flex items-center gap-1 text-[9px] text-blue-100"><TrendingUp size={12} className="text-emerald-300" /> expansão da base comercial</p></div><button type="button" onClick={() => setShowMetrics((value) => !value)} className="grid h-9 w-9 place-items-center rounded-full bg-white/10">{showMetrics ? <Eye size={17} /> : <EyeOff size={17} />}</button></div><div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-2xl bg-white/10 p-2.5"><span className="flex items-center gap-1 text-[8px] text-blue-100"><Nfc size={12} /> Placas</span><strong className="mt-1 block text-sm text-white">{showMetrics ? plates.length : '••'}</strong><small className="text-[8px] text-blue-200">{activePlates} ativas</small></div><div className="rounded-2xl bg-white/10 p-2.5"><span className="flex items-center gap-1 text-[8px] text-blue-100"><Star size={12} /> Google</span><strong className="mt-1 block text-sm text-white">4,8 ★</strong><small className="text-[8px] text-blue-200">média geral</small></div><div className="rounded-2xl bg-white/10 p-2.5"><span className="flex items-center gap-1 text-[8px] text-blue-100"><WalletCards size={12} /> Volume</span><strong className="mt-1 block truncate text-sm text-white">{showMetrics ? money(totalInvested) : '••••'}</strong><small className="text-[8px] text-blue-200">total vendido</small></div></div></div>
      </section>

      <div className="my-5 grid grid-cols-4 gap-2">{actions.map(({ label, icon: Icon, color, action }) => <button key={label} type="button" onClick={action} className="flex min-w-0 flex-col items-center gap-2"><span className={`grid h-14 w-14 place-items-center rounded-2xl shadow-md ${color}`}><Icon size={22} /></span><span className="w-full text-center text-[9px] font-extrabold leading-tight text-slate-600">{label}</span></button>)}</div>

      <div className="relative"><Search size={18} className="absolute left-4 top-3.5 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar cliente, CNPJ ou cidade..." className="w-full rounded-2xl border border-slate-100 bg-white py-3.5 pl-11 pr-12 text-xs shadow-sm outline-none focus:border-blue-400" /><button type="button" className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-500"><Filter size={17} /></button></div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{segmentFilters.map((item) => <button key={item.key} type="button" onClick={() => setSegment(item.key)} className={`shrink-0 rounded-full px-3.5 py-2 text-[9px] font-extrabold ${segment === item.key ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 shadow-sm'}`}>{item.label}</button>)}</div>
      <div className="mt-2 flex items-center gap-2 overflow-x-auto"><span className="shrink-0 text-[8px] font-bold uppercase text-slate-400">Status:</span>{[{ key: 'all', label: 'Todos' }, { key: 'active', label: 'Com placas ativas' }, { key: 'pending', label: 'Pendentes' }].map((item) => <button key={item.key} type="button" onClick={() => setStatus(item.key)} className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[8px] font-extrabold ${status === item.key ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>{item.label}</button>)}</div>

      <div className="mb-3 mt-5 flex items-center justify-between"><h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-800">Diretório de parceiros</h2><span className="text-[9px] text-slate-400">{visibleClients.length} clientes</span></div>
      <div className="space-y-3">
        {visibleClients.map((client, index) => <article key={client.id} className="mobile-card overflow-hidden p-4"><div className="flex items-start gap-3"><span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr text-sm font-extrabold text-white shadow-md ${index % 3 === 0 ? 'from-blue-600 to-indigo-500' : index % 3 === 1 ? 'from-emerald-600 to-teal-400' : 'from-amber-600 to-orange-400'}`}>{client.name.split(' ').slice(0, 2).map((word) => word[0]).join('')}</span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><strong className="block truncate text-xs">{client.name}</strong><p className="mt-1 truncate text-[9px] text-slate-400">{client.business_segment} • {client.city}, {client.state}</p></div><StatusPill tone={client.pending ? 'amber' : 'green'}>{client.pending ? 'Pendente' : 'Ativo'}</StatusPill></div></div></div>{client.pending ? <div className="mt-3 rounded-2xl bg-amber-50 p-3"><strong className="block text-[9px] text-amber-900">Configuração pendente</strong><p className="mt-1 text-[8px] leading-relaxed text-amber-700">Existe uma placa aguardando URL ou ativação.</p></div> : <div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3"><div><span className="block text-[8px] text-slate-400">Hardware</span><strong className="text-[10px]">{client.clientPlates.length} placa(s)</strong><small className="block text-[8px] text-slate-400">{client.activeCount} ativas</small></div><div><span className="block text-[8px] text-slate-400">Avaliações</span><strong className="text-[10px] text-amber-700">{client.rating} ★</strong><small className="block text-[8px] text-slate-400">média</small></div><div><span className="block text-[8px] text-slate-400">Investido</span><strong className="text-[10px] text-emerald-700">{money(client.invested)}</strong><small className="block text-[8px] text-slate-400">{client.taps} taps</small></div></div>}<div className="mt-3 flex items-center justify-between"><div className="flex min-w-0 items-center gap-2"><span className="truncate text-[9px] font-semibold text-slate-600">{client.responsible_name || 'Sem responsável'}</span>{client.phone && <a href={`https://wa.me/55${client.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700"><MessageCircle size={13} /></a>}</div><div className="flex gap-1.5"><button type="button" onClick={() => navigate(client.pending ? '/app/plates' : `/app/clients/${client.id}`)} className={`rounded-xl px-3 py-2 text-[9px] font-extrabold ${client.pending ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'}`}>{client.pending ? 'Configurar placa' : 'Ver detalhes'}</button><button type="button" className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-slate-500"><MoreVertical size={15} /></button></div></div></article>)}
        {!visibleClients.length && <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-xs text-slate-400">Nenhum cliente encontrado.</div>}
      </div>
      <button type="button" onClick={() => setFormOpen(true)} className="fixed bottom-24 right-5 z-20 flex h-14 items-center gap-2 rounded-full bg-blue-600 px-5 text-xs font-extrabold text-white shadow-xl shadow-blue-300"><Plus size={20} /> Cadastrar</button>

      {formOpen && <div className="fixed inset-0 z-50 flex items-end bg-slate-950/55 p-3 backdrop-blur-sm" onClick={() => setFormOpen(false)}><form onSubmit={submitClient} className="mx-auto max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-[28px] bg-white p-5" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><div><h2 className="text-base font-extrabold">Cadastrar cliente</h2><p className="text-[10px] text-slate-400">Novo estabelecimento parceiro</p></div><button type="button" onClick={() => setFormOpen(false)} className="mobile-icon-button"><X size={18} /></button></div><div className="mt-5 space-y-3"><Field label="Nome do estabelecimento *" value={form.name} onChange={(value) => updateField('name', value)} required placeholder="Restaurante Villa Gourmet" /><div className="grid grid-cols-2 gap-3"><Field label="Responsável" value={form.responsible_name} onChange={(value) => updateField('responsible_name', value)} placeholder="Carlos Ferreira" /><Field label="Segmento" value={form.business_segment} onChange={(value) => updateField('business_segment', value)} placeholder="Gastronomia" /></div><div className="grid grid-cols-2 gap-3"><Field label="WhatsApp" value={form.phone} onChange={(value) => updateField('phone', value)} placeholder="(27) 99999-9999" /><Field label="CNPJ ou CPF" value={form.document} onChange={(value) => updateField('document', value)} placeholder="00.000.000/0001-00" /></div><Field label="E-mail" type="email" value={form.email} onChange={(value) => updateField('email', value)} placeholder="contato@empresa.com" /><div className="grid grid-cols-[1fr_80px] gap-3"><Field label="Cidade" value={form.city} onChange={(value) => updateField('city', value)} placeholder="Vila Velha" /><label><span className="text-[9px] font-extrabold text-slate-600">UF</span><select value={form.state} onChange={(event) => updateField('state', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold outline-none"><option>ES</option><option>RJ</option><option>SP</option><option>MG</option><option>BA</option></select></label></div><Field label="Endereço" value={form.address} onChange={(value) => updateField('address', value)} placeholder="Rua, número e bairro" /></div><button type="submit" className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-blue-200">{saved ? <><Check size={16} /> Cliente cadastrado!</> : <><Users size={16} /> Cadastrar cliente</>}</button></form></div>}
    </MobilePage>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder, required = false }) {
  return <label className="block"><span className="text-[9px] font-extrabold text-slate-600">{label}</span><input type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold outline-none focus:border-blue-500" /></label>
}
