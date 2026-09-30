import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Trash2,
  CheckCircle2,
  DollarSign,
  Package,
  Layers
} from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function NewSale() {
  const navigate = useNavigate()
  const { clients, products, addSale } = useApp()

  const [clientId, setClientId] = useState('')
  const [channel, setChannel] = useState('WhatsApp')
  const [location, setLocation] = useState('Loja Vila Velha')
  const [paymentMethod, setPaymentMethod] = useState('Pix')
  const [discount, setDiscount] = useState(0)

  // Items in sale
  const [items, setItems] = useState([
    { productId: products[0]?.id || '', quantity: 1, unitPrice: products[0]?.sale_price || 89.90 }
  ])

  const handleAddItem = () => {
    setItems([
      ...items,
      { productId: products[0]?.id || '', quantity: 1, unitPrice: products[0]?.sale_price || 89.90 }
    ])
  }

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleProductChange = (index, prodId) => {
    const prod = products.find(p => p.id === prodId)
    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      productId: prodId,
      unitPrice: prod ? prod.sale_price : 0
    }
    setItems(newItems)
  }

  const handleQuantityChange = (index, qty) => {
    const newItems = [...items]
    newItems[index].quantity = Math.max(1, parseInt(qty) || 1)
    setItems(newItems)
  }

  const subtotal = items.reduce((acc, curr) => acc + (curr.unitPrice * curr.quantity), 0)
  const total = Math.max(0, subtotal - parseFloat(discount || 0))
  const estimatedCost = items.reduce((acc, curr) => {
    const prod = products.find(p => p.id === curr.productId)
    return acc + ((prod?.cost_price || 15) * curr.quantity)
  }, 0)
  const estimatedProfit = total - estimatedCost

  const handleSubmit = (e) => {
    e.preventDefault()
    const selectedClient = clients.find(c => c.id === clientId)
    const clientName = selectedClient ? selectedClient.name : 'Cliente Avulso'

    addSale({
      client_id: clientId,
      client_name: clientName,
      channel,
      location,
      payment_method: paymentMethod,
      items_count: items.reduce((acc, curr) => acc + curr.quantity, 0),
      subtotal,
      discount: parseFloat(discount || 0),
      total,
      cost: estimatedCost,
      profit: estimatedProfit,
      plates_assigned: []
    })

    navigate('/app/sales')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/app/sales')}
          className="p-2 rounded-xl bg-white border border-cardBorder text-subText hover:text-mainText hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold font-heading text-mainText">Registrar Nova Venda</h1>
          <p className="text-xs text-subText">Lançamento de pedido, movimentação de estoque e faturamento.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Cliente e Canal */}
        <div className="bg-white rounded-card border border-cardBorder p-6 shadow-card space-y-4">
          <h2 className="text-sm font-bold text-mainText pb-2 border-b border-divider">
            1. Dados do Cliente e Canal de Venda
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-mainText mb-1.5">Cliente Destino *</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                className="w-full rounded-xl border border-divider bg-white px-3.5 py-2.5 text-sm text-mainText focus:border-primary focus:outline-none"
              >
                <option value="">Selecione o cliente...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-mainText mb-1.5">Canal da Venda</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full rounded-xl border border-divider bg-white px-3.5 py-2.5 text-sm text-mainText focus:border-primary focus:outline-none"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Instagram">Instagram</option>
                <option value="Indicação">Indicação</option>
                <option value="Loja Física">Loja Física</option>
                <option value="Visita Comercial">Visita Comercial</option>
                <option value="Site / E-commerce">Site / E-commerce</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-mainText mb-1.5">Local da Operação</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-divider bg-white px-3.5 py-2.5 text-sm text-mainText focus:border-primary focus:outline-none"
              >
                <option value="Loja Vila Velha">Loja Vila Velha - ES</option>
                <option value="Visita Comercial">Visita Comercial</option>
                <option value="Feira / Evento">Feira / Evento</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Itens do Pedido */}
        <div className="bg-white rounded-card border border-cardBorder p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-divider">
            <h2 className="text-sm font-bold text-mainText">2. Itens e Produtos</h2>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="gap-1">
              <Plus className="w-3.5 h-3.5" /> Adicionar Produto
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-cardBorder">
                <div className="flex-1 w-full">
                  <label className="block text-[11px] font-semibold text-subText mb-1">Produto</label>
                  <select
                    value={item.productId}
                    onChange={(e) => handleProductChange(index, e.target.value)}
                    className="w-full rounded-lg border border-divider bg-white px-3 py-2 text-xs text-mainText focus:border-primary focus:outline-none"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (R$ {p.sale_price.toFixed(2)}) - Estoque: {p.current_stock} un.
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-24">
                  <label className="block text-[11px] font-semibold text-subText mb-1">Qtd</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                    className="w-full rounded-lg border border-divider bg-white px-3 py-2 text-xs text-mainText focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="w-full sm:w-32">
                  <label className="block text-[11px] font-semibold text-subText mb-1">Preço Unitário</label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.unitPrice}
                    readOnly
                    className="w-full rounded-lg border border-divider bg-gray-50 px-3 py-2 text-xs text-subText font-mono"
                  />
                </div>

                <div className="w-full sm:w-32 text-right">
                  <label className="block text-[11px] font-semibold text-subText mb-1">Subtotal</label>
                  <p className="text-xs font-bold font-heading text-mainText py-2">
                    R$ {(item.unitPrice * item.quantity).toFixed(2)}
                  </p>
                </div>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-subText hover:text-danger p-2 transition-colors self-end sm:self-center"
                    title="Remover item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Pagamento e Total */}
        <div className="bg-white rounded-card border border-cardBorder p-6 shadow-card space-y-4">
          <h2 className="text-sm font-bold text-mainText pb-2 border-b border-divider">
            3. Pagamento e Fechamento
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-mainText mb-1.5">Forma de Pagamento</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl border border-divider bg-white px-3.5 py-2.5 text-sm text-mainText focus:border-primary focus:outline-none"
                >
                  <option value="Pix">Pix (Instantâneo)</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Boleto Bancário">Boleto Bancário</option>
                  <option value="Dinheiro">Dinheiro</option>
                </select>
              </div>

              <div>
                <Input
                  label="Desconto Concedido (R$)"
                  type="number"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Summary Box */}
            <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-cardBorder flex flex-col justify-between">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-subText">
                  <span>Subtotal bruto:</span>
                  <span className="font-mono">R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-subText">
                  <span>Desconto:</span>
                  <span className="font-mono text-danger">- R$ {parseFloat(discount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-subText">
                  <span>Custo de mercadoria estimado:</span>
                  <span className="font-mono">R$ {estimatedCost.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-divider flex justify-between font-bold text-base text-mainText">
                  <span>Total a pagar:</span>
                  <span className="font-heading text-primary">R$ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                  <span>Lucro líquido estimado:</span>
                  <span>R$ {estimatedProfit.toFixed(2)}</span>
                </div>
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full mt-4">
                Confirmar Venda e Baixar Estoque
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
