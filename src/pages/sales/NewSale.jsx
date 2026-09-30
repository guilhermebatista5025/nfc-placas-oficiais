import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronDown, CreditCard, Minus, PackageCheck, Plus, QrCode, Search, ShoppingBag, Smartphone, Trash2, UserRound } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { MobileHeader, MobilePage } from '@/components/mobile/MobileUI'

const channels = ['WhatsApp', 'Instagram', 'Indicação', 'Visita', 'Loja Física']
const payments = ['Pix', 'Cartão', 'Dinheiro']

export function NewSale() {
  const navigate = useNavigate()
  const { clients, products, addSale } = useApp()
  const [clientId, setClientId] = useState(clients[0]?.id || '')
  const [channel, setChannel] = useState('WhatsApp')
  const [payment, setPayment] = useState('Pix')
  const [paid, setPaid] = useState(true)
  const [reserve, setReserve] = useState(true)
  const [discount, setDiscount] = useState(0)
  const [items, setItems] = useState(products.slice(0, 2).map((product) => ({ ...product, quantity: 1 })))
  const [saved, setSaved] = useState(false)
  const client = clients.find((item) => item.id === clientId)
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.sale_price * item.quantity, 0), [items])
  const total = Math.max(0, subtotal - Number(discount || 0))
  const money = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const updateQuantity = (id, amount) => setItems((current) => current.map((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item))
  const addProduct = () => { const next = products.find((product) => !items.some((item) => item.id === product.id)); if (next) setItems((current) => [...current, { ...next, quantity: 1 }]) }
  const submit = () => {
    if (!client || !items.length) return
    addSale({ client_id: client.id, client_name: client.name, channel, location: 'Loja Vila Velha', items_count: items.reduce((sum, item) => sum + item.quantity, 0), product_name: items[0].name, subtotal, discount: Number(discount || 0), total, cost: items.reduce((sum, item) => sum + item.cost_price * item.quantity, 0), profit: total - items.reduce((sum, item) => sum + item.cost_price * item.quantity, 0), payment_method: payment, payment_status: paid ? 'paid' : 'pending', reserve_hardware: reserve })
    setSaved(true)
    setTimeout(() => navigate('/app'), 900)
  }

  return (
    <MobilePage className="pb-36">
      <MobileHeader title="Nova venda" subtitle="Etapa 1 de 3" back compact />
      <div className="mb-5 flex gap-2"><span className="h-1.5 flex-1 rounded-full bg-blue-600" /><span className="h-1.5 flex-1 rounded-full bg-blue-100" /><span className="h-1.5 flex-1 rounded-full bg-blue-100" /></div>

      <section className="mobile-card mb-4 p-4"><div className="mb-4 flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 text-blue-600"><UserRound size={17} /></span><h2 className="text-sm font-extrabold">Cliente & canal</h2></div><label className="text-[10px] font-bold uppercase text-slate-400">Cliente</label><div className="relative mt-1"><Search className="absolute left-3 top-3 text-slate-400" size={16} /><select value={clientId} onChange={(event) => setClientId(event.target.value)} className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-xs font-bold outline-none focus:border-blue-500">{clients.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><ChevronDown className="absolute right-3 top-3 text-slate-400" size={16} /></div><p className="mb-2 mt-4 text-[10px] font-bold uppercase text-slate-400">Canal de captura</p><div className="flex gap-2 overflow-x-auto pb-1">{channels.map((item) => <button key={item} type="button" onClick={() => setChannel(item)} className={`shrink-0 rounded-full px-3 py-2 text-[10px] font-extrabold ${channel === item ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{item}</button>)}</div></section>

      <section className="mobile-card mb-4 p-4"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><ShoppingBag size={17} /></span><h2 className="text-sm font-extrabold">Itens da venda</h2></div><span className="text-[10px] font-bold text-slate-400">{items.length} produtos</span></div><div className="space-y-3">{items.map((item) => <div key={item.id} className="rounded-2xl bg-slate-50 p-3"><div className="flex gap-3"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white text-blue-600 ring-1 ring-slate-100"><QrCode size={22} /></span><div className="min-w-0 flex-1"><strong className="block truncate text-xs">{item.name}</strong><p className="mt-1 text-[10px] text-slate-400">{item.sku}</p><div className="mt-2 flex items-center justify-between"><strong className="text-xs text-blue-600">{money(item.sale_price)}</strong><div className="flex items-center gap-2"><button type="button" onClick={() => updateQuantity(item.id, -1)} className="grid h-7 w-7 place-items-center rounded-lg bg-white ring-1 ring-slate-200"><Minus size={13} /></button><span className="w-4 text-center text-xs font-extrabold">{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.id, 1)} className="grid h-7 w-7 place-items-center rounded-lg bg-blue-600 text-white"><Plus size={13} /></button><button type="button" onClick={() => setItems((current) => current.filter((row) => row.id !== item.id))} className="ml-1 text-rose-400"><Trash2 size={15} /></button></div></div></div></div></div>)}</div><button type="button" onClick={addProduct} disabled={items.length === products.length} className="mt-3 flex w-full items-center justify-center gap-1 rounded-2xl border border-dashed border-blue-200 py-3 text-[10px] font-extrabold text-blue-600 disabled:opacity-40"><Plus size={14} /> Adicionar produto</button></section>

      <section className="mobile-card mb-4 p-4"><div className="mb-4 flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><CreditCard size={17} /></span><h2 className="text-sm font-extrabold">Pagamento & condições</h2></div><div className="grid grid-cols-3 gap-2">{payments.map((item) => <button key={item} type="button" onClick={() => setPayment(item)} className={`rounded-xl py-3 text-[10px] font-extrabold ${payment === item ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>{item}</button>)}</div><div className="mt-4 grid grid-cols-2 gap-3"><label><span className="text-[10px] font-bold text-slate-400">Desconto (R$)</span><input type="number" min="0" value={discount} onChange={(event) => setDiscount(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold outline-none" /></label><div><span className="text-[10px] font-bold text-slate-400">Recebimento</span><button type="button" onClick={() => setPaid((value) => !value)} className={`mt-1 flex w-full items-center justify-center gap-1 rounded-xl p-3 text-xs font-bold ${paid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}><Check size={14} />{paid ? 'Pago' : 'Pendente'}</button></div></div></section>

      <section className="mobile-card p-4"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-600"><PackageCheck size={20} /></span><div><strong className="block text-xs">Reserva de hardware NFC</strong><p className="text-[10px] text-slate-400">Separar placas após confirmar</p></div></div><button type="button" onClick={() => setReserve((value) => !value)} className={`relative h-7 w-12 rounded-full transition ${reserve ? 'bg-blue-600' : 'bg-slate-200'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${reserve ? 'left-6' : 'left-1'}`} /></button></div>{reserve && <div className="mt-3 flex items-center gap-2 rounded-2xl bg-blue-50 p-3 text-[10px] font-semibold text-blue-700"><Smartphone size={15} /> O estoque será reservado automaticamente.</div>}</section>

      <div className="fixed inset-x-0 bottom-[74px] z-30 border-t border-slate-100 bg-white/95 px-5 py-3 backdrop-blur"><div className="mx-auto flex max-w-[440px] items-center gap-4"><div className="flex-1"><span className="text-[9px] font-bold uppercase text-slate-400">Total da venda</span><strong className="block text-lg text-slate-900">{money(total)}</strong></div><button type="button" onClick={submit} disabled={!items.length || saved} className="rounded-2xl bg-blue-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-blue-200 disabled:opacity-60">{saved ? 'Venda registrada!' : 'Confirmar venda'}</button></div></div>
    </MobilePage>
  )
}
