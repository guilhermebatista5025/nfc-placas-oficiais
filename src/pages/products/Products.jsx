import React, { useState } from 'react'
import { Package, Plus, DollarSign, Layers, Tag } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

export function Products() {
  const { products } = useApp()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-mainText">Catálogo de Produtos</h1>
          <p className="text-xs text-subText mt-1">
            Placas acrílicas, totens em L, displays de balcão e chaveiros NFC.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Produto
        </Button>
      </div>

      {/* Grid of Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-card border border-cardBorder p-5 shadow-card flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                  {product.sku}
                </span>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  product.current_stock < product.minimum_stock
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-emerald-50 text-emerald-700'
                }`}>
                  Estoque: {product.current_stock} un.
                </span>
              </div>

              <h3 className="text-sm font-bold text-mainText mt-3 font-heading">
                {product.name}
              </h3>
              <p className="text-xs text-subText mt-1 line-clamp-2">
                {product.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-divider flex items-center justify-between">
              <div>
                <span className="text-[10px] text-subText block">Preço de Venda</span>
                <span className="text-base font-bold font-heading text-mainText">
                  R$ {product.sale_price.toFixed(2)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-subText block">Custo Unitário</span>
                <span className="text-xs font-semibold text-subText font-mono">
                  R$ {product.cost_price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Novo Produto */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cadastrar Novo Produto"
        description="Defina as características técnicas, SKU e valores de custo e venda."
      >
        <form onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }} className="space-y-4">
          <Input label="Nome do Produto" placeholder="Ex: Display NFC Pirâmide" required />
          <Input label="SKU / Código do Produto" placeholder="Ex: NFC-DSP-PIR" required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Preço de Custo (R$)" type="number" step="0.01" placeholder="15.00" required />
            <Input label="Preço de Venda (R$)" type="number" step="0.01" placeholder="79.90" required />
          </div>
          <Input label="Estoque Mínimo Alerta" type="number" placeholder="10" />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary">Salvar Produto</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
