import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowDownToLine, ArrowLeft, Check, CircleDollarSign, TrendingUp, X } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { MobileHeader, MobilePage } from '@/components/mobile/MobileUI'
import googlePlateImage from '@/assets/produtos/placa-google.png'
import blackGooglePlateImage from '@/assets/produtos/placa-preta.png'
import instagramPlateImage from '@/assets/produtos/placas-instagram.png'

const plateSkus = ['NFC-PL-ACR', 'NFC-PL-ACR-BLK', 'NFC-PL-INS']
const emptyQuantities = Object.freeze({})
const productImages = { 'NFC-PL-ACR': googlePlateImage, 'NFC-PL-ACR-BLK': blackGooglePlateImage, 'NFC-PL-INS': instagramPlateImage }
const productLabels = { 'NFC-PL-ACR': 'Placa Google Azul', 'NFC-PL-ACR-BLK': 'Placa Google Preta', 'NFC-PL-INS': 'Placa Instagram' }
const cardColors = {
  'NFC-PL-ACR': 'from-blue-50 to-white border-blue-100',
  'NFC-PL-ACR-BLK': 'from-slate-100 to-white border-slate-200',
  'NFC-PL-INS': 'from-pink-50 to-white border-pink-100',
}
const money = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function InventoryConfigure() {
  const navigate = useNavigate()
  const location = useLocation()
  const { products, updateProductPricing, addPlateBatches } = useApp()
  const quantities = location.state?.quantities ?? emptyQuantities
  const selectedProducts = useMemo(() => plateSkus.map((sku) => products.find((product) => product.sku === sku)).filter((product) => product && Number(quantities[product.sku]) > 0), [products, quantities])
  const totalQuantity = selectedProducts.reduce((sum, product) => sum + Number(quantities[product.sku]), 0)
  const suggestedTotal = selectedProducts.reduce((sum, product) => sum + Number(product.cost_price || 0) * Number(quantities[product.sku]), 0)
  const [purchaseTotal, setPurchaseTotal] = useState(() => suggestedTotal ? String(suggestedTotal.toFixed(2)) : '')
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(true)
  const [salePrices, setSalePrices] = useState(() => Object.fromEntries(selectedProducts.map((product) => [product.sku, String(product.sale_price || '')])))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const cardsRef = useRef([])

  const unitCost = totalQuantity > 0 ? Number(purchaseTotal || 0) / totalQuantity : 0
  const totalSalePotential = selectedProducts.reduce((sum, product) => sum + Number(salePrices[product.sku] || 0) * Number(quantities[product.sku]), 0)
  const grossProfit = totalSalePotential - Number(purchaseTotal || 0)
  const grossMargin = totalSalePotential > 0 ? (grossProfit / totalSalePotential) * 100 : 0

  useEffect(() => {
    if (!totalQuantity) navigate('/app/inventory', { replace: true })
  }, [navigate, totalQuantity])

  useEffect(() => {
    const cards = cardsRef.current.filter(Boolean)
    if (!cards.length) return undefined

    let frame = 0
    const naturalTops = cards.map((card) => card.getBoundingClientRect().top + window.scrollY)
    const updateStack = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        cards.forEach((card, index) => {
          const top = 14 + index * 12
          const distance = card.offsetHeight + 16
          const progress = Math.max(0, Math.min(1, (window.scrollY + top - naturalTops[index]) / distance))
          card.style.transform = `scale(${1 - progress * 0.1})`
          card.style.filter = `brightness(${1 - progress * 0.32})`
          card.style.zIndex = String(index + 1)
        })
      })
    }
    updateStack()
    window.addEventListener('scroll', updateStack, { passive: true })
    window.addEventListener('resize', updateStack)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', updateStack)
      window.removeEventListener('resize', updateStack)
    }
  }, [selectedProducts.length])

  const backToQuantities = () => navigate('/app/inventory', { state: { quantities } })

  const saveAndRegister = async () => {
    if (saving || !selectedProducts.length) return
    const total = Number(purchaseTotal)
    if (!Number.isFinite(total) || total < 0) {
      window.alert('Informe um valor total de compra válido.')
      setPurchaseDialogOpen(true)
      return
    }
    const invalidSale = selectedProducts.find((product) => !Number.isFinite(Number(salePrices[product.sku])) || Number(salePrices[product.sku]) <= 0)
    if (invalidSale) {
      window.alert(`Informe o preço de venda da ${productLabels[invalidSale.sku]}.`)
      return
    }

    setSaving(true)
    try {
      const configuredProducts = []
      for (const product of selectedProducts) {
        configuredProducts.push(await updateProductPricing(product.id, {
          cost_price: unitCost,
          sale_price: Number(salePrices[product.sku]),
          minimum_stock: Number(product.minimum_stock || 0),
        }))
      }
      await addPlateBatches(configuredProducts.map((product) => ({ product, quantity: Number(quantities[product.sku]) })))
      setSaved(true)
      window.setTimeout(() => navigate('/app/plates'), 650)
    } catch (error) {
      window.alert(error.message || 'Não foi possível salvar os valores e registrar a entrada. Confira o estoque antes de tentar novamente.')
    } finally {
      setSaving(false)
    }
  }

  if (!totalQuantity) return null

  return (
    <MobilePage className="pb-36">
      <MobileHeader title="Configurar entrada" subtitle="Valores e investimento" back onBack={backToQuantities} compact />

      <section className="mt-4 rounded-3xl bg-slate-900 p-4 text-white shadow-lg shadow-slate-200">
        <p className="text-[9px] font-bold uppercase tracking-[.16em] text-slate-400">Resumo da compra</p>
        <div className="mt-2 flex items-end justify-between gap-3"><div><strong className="text-3xl font-black">{totalQuantity}</strong><span className="ml-2 text-xs font-semibold text-slate-300">placas selecionadas</span></div><div className="text-right"><span className="block text-[9px] font-semibold text-slate-400">Investimento informado</span><strong className="text-base font-black">{money(purchaseTotal)}</strong></div></div>
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-[10px]"><span className="text-slate-300">Custo médio por placa</span><strong>{money(unitCost)} / un.</strong></div>
      </section>

      <section className="mt-6">
        <div className="mb-4"><p className="text-[9px] font-extrabold uppercase tracking-[.16em] text-blue-600">Etapa 2</p><h2 className="mt-1 text-base font-extrabold text-slate-900">Configure cada categoria</h2><p className="mt-1 text-[10px] text-slate-500">O custo total foi dividido igualmente pelas {totalQuantity} placas selecionadas.</p></div>
        <div className="space-y-3">
          {selectedProducts.map((product, index) => {
            const quantity = Number(quantities[product.sku])
            const salePrice = Number(salePrices[product.sku] || 0)
            const productInvestment = unitCost * quantity
            const productProfit = (salePrice - unitCost) * quantity
            const productMargin = salePrice > 0 ? ((salePrice - unitCost) / salePrice) * 100 : 0
            return <article key={product.id} ref={(element) => { cardsRef.current[index] = element }} style={{ top: `${14 + index * 12}px` }} className={`sticky min-h-[286px] rounded-[28px] border bg-gradient-to-br ${cardColors[product.sku]} p-4 shadow-[0_-10px_30px_rgba(15,23,42,.12)] will-change-transform transition-[filter,transform] duration-100`}>
              <div className="flex items-start gap-3"><div className="grid h-[84px] w-[100px] shrink-0 place-items-center rounded-2xl bg-white/80 p-1"><img src={productImages[product.sku]} alt={productLabels[product.sku]} className="h-full w-full object-contain" /></div><div className="min-w-0 flex-1"><span className="text-[9px] font-extrabold uppercase tracking-[.15em] text-blue-600">Categoria {index + 1}</span><h3 className="mt-1 text-sm font-black text-slate-900">{productLabels[product.sku]}</h3><p className="mt-1 text-[10px] font-semibold text-slate-500">{quantity} unidades nesta entrada</p></div><span className="rounded-full bg-white/80 px-2.5 py-1 text-[9px] font-extrabold text-slate-600">{quantity} un.</span></div>

              <div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-2xl bg-white/80 p-3"><span className="block text-[9px] font-bold uppercase text-slate-400">Investimento nesta categoria</span><strong className="mt-1 block text-sm font-black text-slate-900">{money(productInvestment)}</strong><span className="text-[9px] font-semibold text-slate-500">{money(unitCost)} por placa</span></div><label className="rounded-2xl bg-white/80 p-3"><span className="block text-[9px] font-bold uppercase text-emerald-700">Preço de venda unitário</span><div className="mt-1 flex items-center gap-1"><span className="text-xs font-bold text-slate-400">R$</span><input type="number" min="0.01" step="0.01" required value={salePrices[product.sku] ?? ''} onChange={(event) => setSalePrices((current) => ({ ...current, [product.sku]: event.target.value }))} className="min-w-0 w-full bg-transparent text-sm font-black text-slate-900 outline-none" placeholder="0,00" /></div></label></div>

              <div className="mt-3 flex items-center justify-between rounded-2xl bg-slate-900 px-3 py-2.5 text-white"><span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-300"><TrendingUp size={13} /> Lucro bruto estimado</span><div className="text-right"><strong className={`block text-xs font-black ${productProfit >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{money(productProfit)}</strong><span className="text-[9px] font-bold text-slate-400">margem {productMargin.toFixed(1)}%</span></div></div>
            </article>
          })}
        </div>
      </section>

      <section className="mt-5 rounded-3xl bg-blue-50 p-4"><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-bold text-blue-900"><CircleDollarSign size={16} /> Resultado estimado</span><strong className={`text-sm font-black ${grossProfit >= 0 ? 'text-blue-900' : 'text-rose-700'}`}>{money(grossProfit)}</strong></div><div className="mt-2 flex items-center justify-between text-[10px] text-blue-700"><span>Venda potencial {money(totalSalePotential)}</span><span>Margem {grossMargin.toFixed(1)}%</span></div></section>

      <div className="fixed inset-x-0 bottom-[74px] z-30 border-t border-slate-100 bg-white/95 px-5 py-3 backdrop-blur"><div className="mx-auto flex max-w-[440px] items-center gap-3"><button type="button" onClick={() => setPurchaseDialogOpen(true)} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700" aria-label="Editar investimento total"><CircleDollarSign size={18} /></button><div className="min-w-0 flex-1"><span className="text-[9px] font-bold uppercase text-slate-400">Total do investimento</span><strong className="block truncate text-sm text-slate-900">{money(purchaseTotal)}</strong></div><button type="button" onClick={saveAndRegister} disabled={saving || saved || !purchaseTotal} className="flex shrink-0 items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-xs font-extrabold text-white shadow-lg shadow-blue-200 disabled:cursor-not-allowed disabled:opacity-60"><ArrowDownToLine size={15} />{saving ? 'Salvando…' : saved ? 'Salvo!' : 'Salvar e registrar'}</button></div></div>

      {purchaseDialogOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"><form onSubmit={(event) => { event.preventDefault(); setPurchaseDialogOpen(false) }} className="w-full max-w-sm rounded-[28px] bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3"><div><p className="text-[9px] font-extrabold uppercase tracking-[.16em] text-blue-600">Antes de configurar</p><h2 className="mt-1 text-lg font-black text-slate-900">Quanto deu a compra?</h2><p className="mt-1 text-xs leading-relaxed text-slate-500">Informe o total pago por todas as categorias selecionadas. Vamos calcular o custo unitário automaticamente.</p></div><button type="button" onClick={backToQuantities} aria-label="Voltar para quantidades" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500"><X size={16} /></button></div>
        <label className="mt-5 block rounded-2xl bg-blue-50 p-3"><span className="text-[9px] font-extrabold uppercase text-blue-700">Quantidade total da entrada</span><div className="mt-2 flex items-center rounded-xl bg-white px-3 ring-1 ring-blue-100"><input readOnly type="number" value={totalQuantity} className="w-full bg-transparent p-3 text-lg font-black text-slate-900 outline-none" /><span className="text-xs font-semibold text-slate-400">placas</span></div></label>
        <label className="mt-3 block rounded-2xl bg-emerald-50 p-3"><span className="text-[9px] font-extrabold uppercase text-emerald-700">Valor total pago ao fornecedor</span><div className="mt-2 flex items-center rounded-xl bg-white px-3 ring-1 ring-emerald-100"><span className="text-xs font-bold text-slate-400">R$</span><input autoFocus required min="0" step="0.01" type="number" value={purchaseTotal} onChange={(event) => setPurchaseTotal(event.target.value)} className="min-w-0 flex-1 bg-transparent p-3 text-lg font-black text-slate-900 outline-none" placeholder="0,00" /></div></label>
        <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-[10px] text-slate-600">Custo médio calculado: <strong className="text-slate-900">{money(unitCost)} por placa</strong></div>
        <button type="submit" className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-blue-200"><Check size={16} /> Continuar para os valores</button>
        <button type="button" onClick={backToQuantities} className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-bold text-slate-500"><ArrowLeft size={14} /> Voltar e ajustar quantidades</button>
      </form></div>}
    </MobilePage>
  )
}
