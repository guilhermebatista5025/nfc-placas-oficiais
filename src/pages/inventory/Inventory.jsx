import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Archive, Box, Check, CircleDollarSign, Nfc as Contactless, Minus, PackagePlus, Plus, Save, Settings2, Sparkles, X } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { MobileHeader, MobilePage } from '@/components/mobile/MobileUI'
import googlePlateImage from '@/assets/produtos/placa-google.png'
import instagramPlateImage from '@/assets/produtos/placas-instagram.png'

const presets = [10, 25, 50, 100, 250]
const productImages = { 'prod-01': googlePlateImage, 'prod-02': instagramPlateImage }

export function Inventory() {
  const navigate = useNavigate()
  const carouselRef = useRef(null)
  const { products, updateProductPricing, addPlateBatch, addInventoryMovement } = useApp()
  const plateProducts = products.filter((item) => item.id === 'prod-01' || item.id === 'prod-02')
  const [productId, setProductId] = useState(plateProducts[0]?.id || '')
  const [quantity, setQuantity] = useState(10)
  const [cost, setCost] = useState(products[0]?.cost_price || 0)
  const [salePrice, setSalePrice] = useState(products[0]?.sale_price || 0)
  const [minimumStock, setMinimumStock] = useState(products[0]?.minimum_stock || 0)
  const [saved, setSaved] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const [pricingOpen, setPricingOpen] = useState(false)
  const [pricingSaved, setPricingSaved] = useState(false)
  const [pricingDraft, setPricingDraft] = useState({ cost_price: '', sale_price: '', minimum_stock: '' })
  const product = plateProducts.find((item) => item.id === productId) || plateProducts[0]
  const totalUnits = plateProducts.reduce((sum, item) => sum + Number(item.current_stock || 0), 0)
  const totalCost = Number(cost || 0) * quantity
  const grossResult = Number(salePrice || 0) * quantity
  const netResult = grossResult - totalCost
  const margin = grossResult > 0 ? (netResult / grossResult) * 100 : 0
  const money = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const chooseProduct = (id) => { const next = plateProducts.find((item) => item.id === id); setProductId(id); if (next) { setCost(next.cost_price); setSalePrice(next.sale_price); setMinimumStock(next.minimum_stock) } }
  const openPricing = () => {
    setPricingSaved(false)
    setPricingDraft({ cost_price: cost, sale_price: salePrice, minimum_stock: minimumStock })
    setPricingOpen(true)
  }
  const savePricing = (event) => {
    event.preventDefault()
    const nextCost = Number(pricingDraft.cost_price || 0)
    const nextSalePrice = Number(pricingDraft.sale_price || 0)
    const nextMinimumStock = Number(pricingDraft.minimum_stock || 0)
    setCost(nextCost)
    setSalePrice(nextSalePrice)
    setMinimumStock(nextMinimumStock)
    updateProductPricing(product.id, { cost_price: nextCost, sale_price: nextSalePrice, minimum_stock: nextMinimumStock })
    setPricingSaved(true)
    setTimeout(() => setPricingOpen(false), 650)
  }
  const goToSlide = (index) => {
    carouselRef.current?.scrollTo({ left: carouselRef.current.clientWidth * index, behavior: 'smooth' })
    setActiveSlide(index)
  }
  const submit = () => {
    if (!product || quantity < 1) return
    addPlateBatch({ product, quantity, serialPrefix: product.id === 'prod-01' ? 'GOOGLE' : 'INSTAGRAM', costPrice: cost, salePrice, minimumStock })
    addInventoryMovement({ product_id: product.id, product_name: product.name, type: 'entry', quantity, unit_cost: Number(cost), sale_price: Number(salePrice), gross_result: grossResult, net_result: netResult, reason: `Entrada de lote com ${quantity} placas` })
    setSaved(true)
    setTimeout(() => navigate('/app/plates'), 1100)
  }

  return (
    <MobilePage className="pb-36">
      <MobileHeader title="Cadastrar placas" subtitle="Entrada no estoque" back compact />
      <section className="relative mt-2 overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 p-5 text-white"><div className="absolute -right-10 -bottom-12 h-40 w-40 rounded-full bg-sky-400/20 blur-2xl" /><div className="relative"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Estoque central</p><strong className="mt-1 block text-3xl text-white">{totalUnits}</strong><span className="text-[10px] text-blue-200">unidades disponíveis</span></div><span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20"><Archive size={26} /></span></div><div className="mt-5"><div className="mb-2 flex justify-between text-[9px] font-bold text-blue-200"><span>Capacidade utilizada</span><span>64%</span></div><div className="h-2 rounded-full bg-white/10"><div className="h-2 w-[64%] rounded-full bg-gradient-to-r from-sky-300 to-emerald-300" /></div></div></div></section>

      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between"><div><h2 className="text-sm font-extrabold">Tipo de placa</h2><p className="text-[10px] text-slate-400">Escolha Google ou Instagram</p></div><PackagePlus size={20} className="text-blue-600" /></div>
        <div className="grid grid-cols-2 gap-3">
          {plateProducts.map((item) => (
            <button key={item.id} type="button" onClick={() => chooseProduct(item.id)} className={`relative overflow-hidden rounded-3xl p-2 text-left ring-2 transition ${productId === item.id ? 'bg-white ring-blue-600 shadow-lg shadow-blue-100' : 'bg-white ring-transparent shadow-sm'}`}>
              {productId === item.id && <span className="absolute right-3 top-3 z-10 grid h-6 w-6 place-items-center rounded-full bg-blue-600 text-white shadow"><Check size={13} /></span>}
              <div className="aspect-square overflow-hidden rounded-2xl bg-slate-50"><img src={productImages[item.id]} alt={item.name} className="h-full w-full object-contain" /></div>
              <div className="px-1 pb-1 pt-2"><strong className="block text-[11px] leading-tight text-slate-900">{item.id === 'prod-01' ? 'Placa Google' : 'Placa Instagram'}</strong><div className="mt-1 flex items-center justify-between"><span className="text-[9px] text-slate-400">{item.current_stock} em estoque</span><Contactless size={14} className={item.id === 'prod-01' ? 'text-blue-600' : 'text-pink-500'} /></div></div>
            </button>
          ))}
        </div>
      </section>

      <div
        ref={carouselRef}
        onScroll={(event) => setActiveSlide(Math.round(event.currentTarget.scrollLeft / event.currentTarget.clientWidth))}
        className="mobile-carousel -mx-1 mt-4 flex snap-x snap-mandatory overflow-x-auto px-1 pb-2"
      >
      <section className="mobile-card min-w-full snap-center p-4">
        <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><Box size={17} /></span><div><h2 className="text-sm font-extrabold">Quantidade e valores</h2><p className="text-[9px] text-slate-400">Compra, venda e estoque mínimo</p></div></div><button type="button" onClick={openPricing} className="flex shrink-0 items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-[9px] font-extrabold text-white shadow-md shadow-blue-100"><Settings2 size={13} />{product?.pricing_configured ? 'Editar valores' : 'Definir valores'}</button></div>
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 p-2"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="grid h-11 w-11 place-items-center rounded-xl bg-white shadow-sm"><Minus size={17} /></button><div className="text-center"><strong className="block text-2xl">{quantity}</strong><span className="text-[9px] font-bold text-slate-400">UNIDADES DO LOTE</span></div><button type="button" onClick={() => setQuantity((value) => value + 1)} className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200"><Plus size={17} /></button></div>
        <div className="mt-3 flex gap-2 overflow-x-auto">{presets.map((item) => <button key={item} type="button" onClick={() => setQuantity(item)} className={`shrink-0 rounded-full px-3 py-2 text-[10px] font-extrabold ${quantity === item ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>+{item}</button>)}</div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-rose-50 p-3"><span className="text-[8px] font-bold uppercase text-rose-500">Fornecedor</span><strong className="mt-1 block text-xs text-slate-900">{money(Number(cost || 0))}</strong><small className="text-[8px] text-rose-400">por unidade</small></div>
          <div className="rounded-2xl bg-emerald-50 p-3"><span className="text-[8px] font-bold uppercase text-emerald-600">Venda</span><strong className="mt-1 block text-xs text-slate-900">{money(Number(salePrice || 0))}</strong><small className="text-[8px] text-emerald-500">por unidade</small></div>
          <div className="rounded-2xl bg-amber-50 p-3"><span className="text-[8px] font-bold uppercase text-amber-600">Mínimo</span><strong className="mt-1 block text-xs text-slate-900">{minimumStock}</strong><small className="text-[8px] text-amber-500">unidades</small></div>
        </div>
      </section>

      <section className="mobile-card min-w-full snap-center overflow-hidden p-4">
        <div className="mb-3 flex items-center justify-between"><div><h2 className="text-sm font-extrabold">Resultado estimado do lote</h2><p className="text-[9px] text-slate-400">Considerando a venda das {quantity} unidades</p></div><span className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold ${netResult >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{margin.toFixed(1)}% margem</span></div>
        <div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-blue-50 p-3"><span className="text-[9px] font-bold uppercase text-blue-500">Resultado bruto</span><strong className="mt-1 block text-base text-blue-800">{money(grossResult)}</strong><small className="text-[8px] text-blue-400">vendas sem descontar custos</small></div><div className={`rounded-2xl p-3 ${netResult >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}><span className={`text-[9px] font-bold uppercase ${netResult >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>Resultado líquido</span><strong className={`mt-1 block text-base ${netResult >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>{money(netResult)}</strong><small className={netResult >= 0 ? 'text-emerald-500' : 'text-rose-500'}>bruto menos fornecedor</small></div></div>
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-slate-900 p-3 text-white"><span className="text-[10px] font-semibold text-slate-300">Investimento no fornecedor</span><strong className="text-sm text-white">{money(totalCost)}</strong></div>
      </section>
      </div>
      <div className="mt-1 flex items-center justify-center gap-2">
        {[0, 1].map((index) => <button key={index} type="button" aria-label={`Ir para página ${index + 1}`} onClick={() => goToSlide(index)} className={`h-1.5 rounded-full transition-all ${activeSlide === index ? 'w-6 bg-blue-600' : 'w-1.5 bg-slate-300'}`} />)}
      </div>
      <p className="mt-2 text-center text-[9px] font-semibold text-slate-400">{activeSlide === 0 ? 'Arraste para a esquerda para ver o resultado →' : '← Arraste para voltar aos valores'}</p>

      {pricingOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-950/55 p-3 backdrop-blur-sm" onClick={() => setPricingOpen(false)}>
          <form onSubmit={savePricing} className="mx-auto w-full max-w-md rounded-[28px] bg-white p-5" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between"><div><h2 className="text-base font-extrabold">{product?.pricing_configured ? 'Editar valores' : 'Configurar valores'}</h2><p className="mt-0.5 text-[10px] text-slate-400">{product?.id === 'prod-01' ? 'Placa Google' : 'Placa Instagram'} • os dados ficarão salvos</p></div><button type="button" onClick={() => setPricingOpen(false)} className="mobile-icon-button"><X size={18} /></button></div>
            <div className="mt-5 space-y-3">
              <label className="block rounded-2xl bg-rose-50 p-3"><span className="flex items-center gap-1 text-[9px] font-extrabold uppercase text-rose-500"><CircleDollarSign size={13} /> Valor pago ao fornecedor</span><div className="mt-2 flex items-center rounded-xl bg-white px-3 ring-1 ring-rose-100"><span className="text-xs font-bold text-slate-400">R$</span><input required autoFocus type="number" min="0" step="0.01" value={pricingDraft.cost_price} onChange={(event) => setPricingDraft((current) => ({ ...current, cost_price: event.target.value }))} className="min-w-0 flex-1 bg-transparent p-3 text-sm font-extrabold outline-none" /></div><small className="mt-1 block text-[8px] text-rose-400">Custo de compra de uma placa</small></label>
              <label className="block rounded-2xl bg-emerald-50 p-3"><span className="flex items-center gap-1 text-[9px] font-extrabold uppercase text-emerald-600"><CircleDollarSign size={13} /> Preço de venda</span><div className="mt-2 flex items-center rounded-xl bg-white px-3 ring-1 ring-emerald-100"><span className="text-xs font-bold text-slate-400">R$</span><input required type="number" min="0" step="0.01" value={pricingDraft.sale_price} onChange={(event) => setPricingDraft((current) => ({ ...current, sale_price: event.target.value }))} className="min-w-0 flex-1 bg-transparent p-3 text-sm font-extrabold outline-none" /></div><small className="mt-1 block text-[8px] text-emerald-500">Valor cobrado por uma placa</small></label>
              <label className="block rounded-2xl bg-amber-50 p-3"><span className="text-[9px] font-extrabold uppercase text-amber-700">Quantidade mínima em estoque</span><input required type="number" min="0" step="1" value={pricingDraft.minimum_stock} onChange={(event) => setPricingDraft((current) => ({ ...current, minimum_stock: event.target.value }))} className="mt-2 w-full rounded-xl bg-white p-3 text-sm font-extrabold outline-none ring-1 ring-amber-100" /><small className="mt-1 block text-[8px] text-amber-600">Limite para gerar o alerta de reposição</small></label>
            </div>
            <button type="submit" className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-blue-200">{pricingSaved ? <><Check size={16} /> Valores salvos!</> : <><Save size={16} /> Salvar valores</>}</button>
          </form>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-[74px] z-30 border-t border-slate-100 bg-white/95 px-5 py-3 backdrop-blur"><div className="mx-auto flex max-w-[440px] items-center gap-4"><div className="flex-1"><span className="text-[9px] font-bold uppercase text-slate-400">Nova entrada</span><strong className="block text-sm">{quantity} placas • {money(totalCost)}</strong></div><button type="button" onClick={submit} disabled={saved} className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-blue-200 disabled:opacity-60">{saved ? <><Check size={16} /> Cadastrado!</> : <><Sparkles size={16} /> Confirmar lote</>}</button></div></div>
    </MobilePage>
  )
}
