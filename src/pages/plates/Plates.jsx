import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bluetooth, Check, Copy, Filter, Link2, MapPin, Nfc, Pencil, Plus, QrCode, Save, ScanLine, Search, Settings2, UserRound, Wifi, X } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { EmptyMobile, MobileHeader, MobilePage, StatusPill } from '@/components/mobile/MobileUI'

const filters = [{ key: 'all', label: 'Todas' }, { key: 'active', label: 'Ativas' }, { key: 'configuring', label: 'Configurando' }, { key: 'in_stock', label: 'Estoque' }]
const statusMap = { active: ['Ativa', 'green'], configuring: ['Configurando', 'amber'], in_stock: ['Em estoque', 'blue'], sold: ['Vendida', 'slate'], reserved: ['Reservada', 'amber'], disabled: ['Desativada', 'rose'] }

export function Plates() {
  const navigate = useNavigate()
  const { plates, clients, updatePlate } = useApp()
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [qrPlate, setQrPlate] = useState(null)
  const [configuringPlate, setConfiguringPlate] = useState(null)
  const [form, setForm] = useState({ code: '', serial_number: '', client_id: '', google_review_url: '', status: 'configuring' })
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const visible = useMemo(() => plates.filter((plate) => (filter === 'all' || plate.status === filter) && `${plate.code} ${plate.client_name || ''} ${plate.product_name}`.toLowerCase().includes(query.toLowerCase())), [plates, filter, query])

  const openConfiguration = (plate) => {
    setConfiguringPlate(plate)
    setSaved(false)
    setForm({ code: plate.code || '', serial_number: plate.serial_number || '', client_id: plate.client_id || '', google_review_url: plate.google_review_url || '', status: plate.status || 'configuring' })
  }
  const saveConfiguration = (event) => {
    event.preventDefault()
    const client = clients.find((item) => item.id === form.client_id)
    updatePlate(configuringPlate.id, { ...form, client_name: client?.name || null })
    setSaved(true)
    setTimeout(() => setConfiguringPlate(null), 650)
  }
  const copyLink = async (plate) => {
    await navigator.clipboard?.writeText(plate.qr_code_url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <MobilePage>
      <MobileHeader title="Gestão de placas" subtitle={`${plates.length} dispositivos`} actions={<button type="button" className="mobile-icon-button" aria-label="Filtros"><Filter size={19} /></button>} />
      <div className="relative mt-2"><Search className="absolute left-4 top-3.5 text-slate-400" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar placa, cliente ou código" className="w-full rounded-2xl border border-slate-100 bg-white py-3.5 pl-11 pr-12 text-xs font-semibold shadow-sm outline-none focus:border-blue-400" /><button type="button" className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white"><ScanLine size={18} /></button></div>
      <div className="my-4 flex gap-2 overflow-x-auto pb-1">{filters.map((item) => <button key={item.key} type="button" onClick={() => setFilter(item.key)} className={`shrink-0 rounded-full px-4 py-2.5 text-[10px] font-extrabold ${filter === item.key ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-white text-slate-500 ring-1 ring-slate-100'}`}>{item.label}</button>)}</div>

      <section className="relative mb-5 overflow-hidden rounded-[26px] bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 p-5 text-white"><div className="absolute -right-6 -top-10 h-32 w-32 rounded-full bg-blue-500/30 blur-2xl" /><div className="relative flex items-center gap-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15"><Bluetooth size={26} /></span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><strong className="text-sm text-white">Leitor NFC conectado</strong><span className="h-2 w-2 rounded-full bg-emerald-400" /></div><p className="mt-1 text-[10px] text-blue-200">Craft Reader • pronto para gravar</p></div><Wifi size={18} className="text-emerald-300" /></div></section>

      <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-extrabold">Suas placas</h2><span className="text-[10px] font-bold text-slate-400">{visible.length} resultados</span></div>
      <div className="space-y-3">
        {visible.length ? visible.map((plate) => {
          const [label, tone] = statusMap[plate.status] || statusMap.in_stock
          return (
            <article key={plate.id} className="mobile-card overflow-hidden p-4">
              <div className="flex items-start gap-3"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Nfc size={23} /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><strong className="block truncate text-xs text-slate-900">{plate.client_name || 'Placa sem cliente'}</strong><p className="mt-1 truncate text-[10px] text-slate-400">{plate.product_name}</p></div><StatusPill tone={tone}>{label}</StatusPill></div><p className="mt-2 font-mono text-[10px] font-bold text-slate-500">{plate.code} • {plate.serial_number}</p></div></div>
              <div className={`mt-3 rounded-2xl p-3 ${plate.google_review_url ? 'bg-slate-50' : 'bg-amber-50'}`}><p className={`truncate text-[10px] font-semibold ${plate.google_review_url ? 'text-slate-500' : 'text-amber-700'}`}>{plate.google_review_url || 'Aguardando URL do Google Maps / Instagram'}</p></div>
              <div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={() => setQrPlate(plate)} className="flex items-center justify-center gap-1 rounded-xl bg-blue-600 py-2.5 text-[10px] font-bold text-white"><QrCode size={14} /> Ver QR Code</button><button type="button" onClick={() => openConfiguration(plate)} className="flex items-center justify-center gap-1 rounded-xl bg-slate-100 py-2.5 text-[10px] font-bold text-slate-600"><Settings2 size={14} /> Configurar</button></div>
            </article>
          )
        }) : <EmptyMobile>Nenhuma placa encontrada.</EmptyMobile>}
      </div>

      <div className="mt-5 grid grid-cols-3 divide-x divide-slate-100 rounded-2xl bg-white p-4 text-center shadow-sm"><div><strong className="block text-lg text-blue-600">{plates.filter((p) => p.status === 'active').length}</strong><span className="text-[9px] text-slate-400">Ativas</span></div><div><strong className="block text-lg text-amber-500">{plates.filter((p) => p.status === 'configuring').length}</strong><span className="text-[9px] text-slate-400">Configurando</span></div><div><strong className="block text-lg text-sky-500">{plates.filter((p) => p.status === 'in_stock').length}</strong><span className="text-[9px] text-slate-400">Estoque</span></div></div>
      <button type="button" onClick={() => navigate('/app/inventory')} className="fixed bottom-24 right-5 z-20 grid h-14 w-14 place-items-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-300"><Plus size={24} /></button>

      {configuringPlate && (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-950/55 p-3 backdrop-blur-sm" onClick={() => setConfiguringPlate(null)}>
          <form onSubmit={saveConfiguration} className="mx-auto max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-[28px] bg-white p-5" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between"><div><h2 className="text-base font-extrabold">Configurar placa</h2><p className="text-[10px] text-slate-400">Edite o identificador e o destino da placa</p></div><button type="button" onClick={() => setConfiguringPlate(null)} className="mobile-icon-button"><X size={18} /></button></div>
            <div className="mt-5 space-y-4">
              <label className="block"><span className="text-[10px] font-extrabold text-slate-600">Número da placa</span><div className="relative mt-1"><Pencil size={15} className="absolute left-3 top-3.5 text-slate-400" /><input required value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} placeholder="NFC-000001" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-3 font-mono text-xs font-bold outline-none focus:border-blue-500" /></div></label>
              <label className="block"><span className="text-[10px] font-extrabold text-slate-600">Número serial / chip NFC</span><div className="relative mt-1"><Nfc size={15} className="absolute left-3 top-3.5 text-slate-400" /><input value={form.serial_number} onChange={(event) => setForm((current) => ({ ...current, serial_number: event.target.value.toUpperCase() }))} placeholder="SN-NFC-00001" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-3 font-mono text-xs font-bold outline-none focus:border-blue-500" /></div></label>
              <label className="block"><span className="text-[10px] font-extrabold text-slate-600">Cliente vinculado</span><div className="relative mt-1"><UserRound size={15} className="absolute left-3 top-3.5 text-slate-400" /><select value={form.client_id} onChange={(event) => setForm((current) => ({ ...current, client_id: event.target.value }))} className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-3 text-xs font-bold outline-none focus:border-blue-500"><option value="">Nenhum cliente</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></div></label>
              <label className="block"><span className="text-[10px] font-extrabold text-slate-600">URL do Google Maps, avaliação ou Instagram</span><div className="relative mt-1"><MapPin size={15} className="absolute left-3 top-3.5 text-slate-400" /><input type="url" value={form.google_review_url} onChange={(event) => setForm((current) => ({ ...current, google_review_url: event.target.value }))} placeholder="https://maps.app.goo.gl/..." className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-3 text-xs font-semibold outline-none focus:border-blue-500" /></div><small className="mt-1 block text-[9px] text-slate-400">Esse será o destino usado pelo NFC e pelo QR Code.</small></label>
              <label className="block"><span className="text-[10px] font-extrabold text-slate-600">Status da placa</span><select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold outline-none focus:border-blue-500"><option value="in_stock">Em estoque</option><option value="reserved">Reservada</option><option value="sold">Vendida</option><option value="configuring">Configurando</option><option value="active">Ativa</option><option value="disabled">Desativada</option></select></label>
            </div>
            <button type="submit" className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-blue-200">{saved ? <><Check size={16} /> Configuração salva!</> : <><Save size={16} /> Salvar configuração</>}</button>
          </form>
        </div>
      )}

      {qrPlate && (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-950/55 p-3 backdrop-blur-sm" onClick={() => setQrPlate(null)}><div className="mx-auto w-full max-w-md rounded-[28px] bg-white p-5" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><div><h2 className="text-base font-extrabold">QR Code da placa</h2><p className="font-mono text-[10px] text-slate-400">{qrPlate.code}</p></div><button type="button" onClick={() => setQrPlate(null)} className="mobile-icon-button"><X size={18} /></button></div><div className="mx-auto my-5 grid h-52 w-52 place-items-center rounded-3xl bg-slate-50 ring-1 ring-slate-100"><QrCode size={150} strokeWidth={1.3} /></div><p className="truncate rounded-xl bg-slate-50 p-3 text-center text-[10px] text-slate-500">{qrPlate.google_review_url || qrPlate.qr_code_url}</p><div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={() => copyLink(qrPlate)} className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 py-3 text-xs font-bold"><Copy size={15} />{copied ? 'Copiado!' : 'Copiar link'}</button><button type="button" onClick={() => { openConfiguration(qrPlate); setQrPlate(null) }} className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-xs font-bold text-white"><Link2 size={15} /> Configurar</button></div></div></div>
      )}
    </MobilePage>
  )
}
