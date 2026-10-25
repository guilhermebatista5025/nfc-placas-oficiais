import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Archive, ArrowRight, Clock3, Minus, Plus } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { MobileHeader, MobilePage } from '@/components/mobile/MobileUI'
import { InventoryMovementsSheet } from '@/components/mobile/InventoryMovementsSheet'
import googlePlateImage from '@/assets/produtos/placa-google.png'
import blackGooglePlateImage from '@/assets/produtos/placa-preta.png'
import instagramPlateImage from '@/assets/produtos/placas-instagram.png'

const presets = [10, 25, 50, 100, 250]
const plateSkus = ['NFC-PL-ACR', 'NFC-PL-ACR-BLK', 'NFC-PL-INS']
const productImages = { 'NFC-PL-ACR': googlePlateImage, 'NFC-PL-ACR-BLK': blackGooglePlateImage, 'NFC-PL-INS': instagramPlateImage }
const productLabels = { 'NFC-PL-ACR': 'Placa Google Azul', 'NFC-PL-ACR-BLK': 'Placa Google Preta', 'NFC-PL-INS': 'Placa Instagram' }

export function Inventory() {
  const navigate = useNavigate()
  const location = useLocation()
  const { products, loading, ensurePlateProducts } = useApp()
  const plateProducts = useMemo(() => plateSkus.map((sku) => products.find((item) => item.sku === sku)).filter(Boolean), [products])
  const [quantities, setQuantities] = useState(() => location.state?.quantities || { 'NFC-PL-ACR': 0, 'NFC-PL-ACR-BLK': 0, 'NFC-PL-INS': 0 })
  const [historyOpen, setHistoryOpen] = useState(false)
  const [catalogError, setCatalogError] = useState('')
  const [ensuringCatalog, setEnsuringCatalog] = useState(false)
  const catalogAttempted = useRef(false)

  useEffect(() => {
    if (loading || plateProducts.length === plateSkus.length || catalogAttempted.current) return
    catalogAttempted.current = true
    let active = true
    setEnsuringCatalog(true)
    ensurePlateProducts().catch((error) => {
      if (active) setCatalogError(error.message || 'Não foi possível carregar as placas.')
    }).finally(() => {
      if (active) setEnsuringCatalog(false)
    })
    return () => { active = false }
  }, [loading, plateProducts.length, ensurePlateProducts])

  const totalQuantity = plateProducts.reduce((sum, item) => sum + Number(quantities[item.sku] || 0), 0)
  const totalUnits = plateProducts.reduce((sum, item) => sum + Number(item.current_stock || 0), 0)

  const changeQuantity = (sku, next) => {
    setQuantities((current) => ({ ...current, [sku]: Math.max(0, Math.floor(Number(next) || 0)) }))
  }

  const goToConfiguration = () => {
    if (!totalQuantity) return
    navigate('/app/inventory/configure', { state: { quantities } })
  }

  return (
    <MobilePage className="pb-36">
      <MobileHeader title="Estoque" subtitle="Entrada de placas" back compact actions={(
        <button type="button" onClick={() => setHistoryOpen(true)} className="flex h-10 items-center gap-2 rounded-full border border-slate-100 bg-white px-3 text-[10px] font-bold text-slate-600 shadow-sm"><Clock3 size={15} /> Histórico</button>
      )} />

      <section className="mt-3 flex items-center justify-between rounded-3xl bg-slate-900 p-4 text-white shadow-lg shadow-slate-200">
        <div><p className="text-[9px] font-bold uppercase tracking-[.16em] text-slate-400">Saldo atual</p><div className="mt-1 flex items-baseline gap-2"><strong className="text-3xl font-black">{totalUnits}</strong><span className="text-[11px] font-semibold text-slate-300">placas em estoque</span></div></div>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-blue-300"><Archive size={23} /></span>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between"><div><p className="text-[9px] font-extrabold uppercase tracking-[.16em] text-blue-600">Etapa 1</p><h2 className="mt-1 text-base font-extrabold text-slate-900">O que chegou do fornecedor?</h2></div><span className="text-[10px] font-semibold text-slate-400">{plateProducts.length}/{plateSkus.length} tipos</span></div>
        {loading || ensuringCatalog ? <div className="rounded-2xl border border-slate-100 bg-white p-5 text-center text-xs font-semibold text-slate-400">Carregando placas…</div> : plateProducts.length ? (
          <div className="space-y-3">
            {plateProducts.map((product) => {
              const quantity = Number(quantities[product.sku] || 0)
              return <article key={product.id} className={`rounded-3xl border bg-white p-4 shadow-sm ${quantity ? 'border-blue-200 ring-1 ring-blue-100' : 'border-slate-100'}`}>
                <div className="flex items-center gap-3">
                  <div className="grid h-[76px] w-[88px] shrink-0 place-items-center rounded-2xl bg-slate-50"><img src={productImages[product.sku]} alt={productLabels[product.sku]} className="h-full w-full object-contain" /></div>
                  <div className="min-w-0 flex-1"><strong className="block truncate text-sm font-extrabold text-slate-900">{productLabels[product.sku]}</strong><p className="mt-1 text-[10px] text-slate-400">{Number(product.current_stock || 0)} em estoque</p></div>
                  <div className="flex shrink-0 items-center gap-2"><button type="button" aria-label={`Diminuir ${productLabels[product.sku]}`} onClick={() => changeQuantity(product.sku, quantity - 1)} className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600"><Minus size={15} /></button><input aria-label={`Quantidade de ${productLabels[product.sku]}`} type="number" min="0" step="1" value={quantity} onChange={(event) => changeQuantity(product.sku, event.target.value)} className="w-12 rounded-lg bg-transparent text-center text-base font-black text-slate-900 outline-none" /><button type="button" aria-label={`Aumentar ${productLabels[product.sku]}`} onClick={() => changeQuantity(product.sku, quantity + 1)} className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200"><Plus size={15} /></button></div>
                </div>
                <div className="mt-3 flex gap-2 overflow-x-auto border-t border-slate-100 pt-3">{presets.map((preset) => <button key={preset} type="button" onClick={() => changeQuantity(product.sku, preset)} className={`shrink-0 rounded-full px-3 py-1.5 text-[9px] font-extrabold ${quantity === preset ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>{preset} un.</button>)}</div>
              </article>
            })}
          </div>
        ) : <div className="rounded-2xl border border-dashed border-rose-200 bg-white p-5 text-center text-xs text-rose-600">{catalogError || 'Não foi possível disponibilizar as placas para entrada.'}</div>}
      </section>

      <div className="fixed inset-x-0 bottom-[74px] z-30 border-t border-slate-100 bg-white/95 px-5 py-3 backdrop-blur"><div className="mx-auto flex max-w-[440px] items-center gap-4"><div className="min-w-0 flex-1"><span className="text-[9px] font-bold uppercase text-slate-400">Total da entrada</span><strong className="block truncate text-sm text-slate-900">{totalQuantity} placas</strong></div><button type="button" onClick={goToConfiguration} disabled={!totalQuantity || loading || ensuringCatalog} className="flex shrink-0 items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-blue-200 disabled:cursor-not-allowed disabled:opacity-60">Configurar valores <ArrowRight size={15} /></button></div></div>
      <InventoryMovementsSheet open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </MobilePage>
  )
}
