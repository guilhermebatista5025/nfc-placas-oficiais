import React, { useState } from 'react'
import { Layers, Plus, ArrowUpRight, ArrowDownLeft, RefreshCw, Undo2 } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

export function Inventory() {
  const { inventoryMovements, products, addInventoryMovement } = useApp()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [productId, setProductId] = useState(products[0]?.id || '')
  const [type, setType] = useState('entry')
  const [quantity, setQuantity] = useState(10)
  const [reason, setReason] = useState('')

  const handleCreateMovement = (e) => {
    e.preventDefault()
    const product = products.find(p => p.id === productId)
    const qtyNumber = parseInt(quantity) || 1
    const finalQty = type === 'exit' ? -Math.abs(qtyNumber) : Math.abs(qtyNumber)

    addInventoryMovement({
      type,
      product_name: product ? product.name : 'Produto Geral',
      quantity: finalQty,
      reason: reason || (type === 'entry' ? 'Entrada de lote' : 'Ajuste operacional')
    })

    setIsModalOpen(false)
    setReason('')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-mainText">Controle de Estoque</h1>
          <p className="text-xs text-subText mt-1">
            Rastreamento de entradas de peças, saídas para vendas e histórico de reposição.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Nova Movimentação
        </Button>
      </div>

      {/* Mobile Movements Cards (sm:hidden) */}
      <div className="space-y-3 sm:hidden">
        {inventoryMovements.map((mov) => {
          const isPositive = mov.quantity > 0
          return (
            <div
              key={mov.id}
              className="bg-white rounded-2xl border border-cardBorder p-4 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  {mov.type === 'entry' && (
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold text-[11px]">
                      <ArrowDownLeft className="w-3.5 h-3.5" /> Entrada
                    </span>
                  )}
                  {mov.type === 'exit' && (
                    <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full font-semibold text-[11px]">
                      <ArrowUpRight className="w-3.5 h-3.5" /> Saída
                    </span>
                  )}
                  {mov.type === 'adjustment' && (
                    <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-semibold text-[11px]">
                      <RefreshCw className="w-3.5 h-3.5" /> Ajuste
                    </span>
                  )}
                  {mov.type === 'return' && (
                    <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-semibold text-[11px]">
                      <Undo2 className="w-3.5 h-3.5" /> Devolução
                    </span>
                  )}
                </div>
                <span className={`font-mono font-bold text-sm ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isPositive ? `+${mov.quantity}` : mov.quantity} un.
                </span>
              </div>

              <div>
                <p className="text-xs font-bold text-mainText">{mov.product_name}</p>
                <p className="text-xs text-subText mt-0.5">{mov.reason}</p>
              </div>

              <div className="pt-2 border-t border-divider flex items-center justify-between text-[11px] text-subText">
                <span>Por: {mov.author || 'Admin'}</span>
                <span className="font-mono">{mov.created_at}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop Movements Table (hidden sm:block) */}
      <div className="hidden sm:block bg-white rounded-card border border-cardBorder shadow-card overflow-hidden">
        <div className="p-4 border-b border-divider">
          <h2 className="text-sm font-bold text-mainText">Extrato de Movimentações</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-divider bg-[#F8FAFC] text-[11px] font-semibold text-subText uppercase tracking-wider">
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Produto</th>
                <th className="py-3 px-4">Quantidade</th>
                <th className="py-3 px-4">Motivo / Origem</th>
                <th className="py-3 px-4">Responsável</th>
                <th className="py-3 px-4">Data e Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider/70 text-xs">
              {inventoryMovements.map((mov) => {
                const isPositive = mov.quantity > 0
                return (
                  <tr key={mov.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      {mov.type === 'entry' && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold text-[11px]">
                          <ArrowDownLeft className="w-3.5 h-3.5" /> Entrada
                        </span>
                      )}
                      {mov.type === 'exit' && (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full font-semibold text-[11px]">
                          <ArrowUpRight className="w-3.5 h-3.5" /> Saída
                        </span>
                      )}
                      {mov.type === 'adjustment' && (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-semibold text-[11px]">
                          <RefreshCw className="w-3.5 h-3.5" /> Ajuste
                        </span>
                      )}
                      {mov.type === 'return' && (
                        <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-semibold text-[11px]">
                          <Undo2 className="w-3.5 h-3.5" /> Devolução
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-mainText">
                      {mov.product_name}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className={isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                        {isPositive ? `+${mov.quantity}` : mov.quantity} un.
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-mainText">
                      {mov.reason}
                    </td>
                    <td className="py-3.5 px-4 text-subText">
                      {mov.author || 'Admin'}
                    </td>
                    <td className="py-3.5 px-4 text-subText font-mono">
                      {mov.created_at}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova Movimentacao */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Lançar Movimentação de Estoque"
        description="Registre entradas de novos lotes de placas ou ajustes manuais de balanço."
      >
        <form onSubmit={handleCreateMovement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-mainText mb-1.5">Produto</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full rounded-xl border border-divider bg-white px-3.5 py-2.5 text-sm text-mainText focus:border-primary focus:outline-none"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (Atual: {p.current_stock})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-mainText mb-1.5">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-divider bg-white px-3.5 py-2.5 text-sm text-mainText focus:border-primary focus:outline-none"
              >
                <option value="entry">Entrada (+)</option>
                <option value="exit">Saída (-)</option>
                <option value="adjustment">Ajuste de Balanço</option>
                <option value="return">Devolução</option>
              </select>
            </div>
            <Input
              label="Quantidade"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <Input
            label="Motivo / Observação"
            placeholder="Ex: Chegada de lote importado"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary">Confirmar Movimentação</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
