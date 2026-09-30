import React from 'react'
import {
  ShoppingCart,
  Plus,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Building,
  CheckCircle2
} from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useNavigate } from 'react-router-dom'

export function Sales() {
  const { sales, searchQuery } = useApp()
  const navigate = useNavigate()

  const filteredSales = sales.filter(s => {
    const q = searchQuery.toLowerCase()
    return (
      !searchQuery ||
      s.number.includes(q) ||
      s.client_name.toLowerCase().includes(q) ||
      s.channel.toLowerCase().includes(q) ||
      s.payment_method.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-mainText">Vendas & Pedidos</h1>
          <p className="text-xs text-subText mt-1">
            Histórico financeiro, canais de comercialização e vínculo com placas despachadas.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/app/sales/new')}
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Registrar Venda
        </Button>
      </div>

      {/* Mobile Sales Cards (sm:hidden) */}
      <div className="space-y-3 sm:hidden">
        {filteredSales.map((sale) => (
          <div
            key={sale.id}
            className="bg-white rounded-2xl border border-cardBorder p-4 shadow-sm space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-sm text-mainText">Venda #{sale.number}</span>
              <Badge variant={sale.status === 'completed' ? 'success' : 'warning'}>
                {sale.status === 'completed' ? 'Concluída' : 'Processando'}
              </Badge>
            </div>

            <div>
              <p className="text-xs font-semibold text-mainText">{sale.client_name}</p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-subText">
                <span className="bg-gray-100 px-1.5 py-0.5 rounded font-medium">{sale.channel}</span>
                <span>• {sale.location}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-divider flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-subText block">{sale.payment_method}</span>
                <span className="font-bold font-heading text-mainText text-sm">R$ {sale.total.toFixed(2)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-subText block">Lucro</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[11px] inline-block">
                  + R$ {sale.profit.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Sales Table (hidden sm:block) */}
      <div className="hidden sm:block bg-white rounded-card border border-cardBorder shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-divider bg-[#F8FAFC] text-[11px] font-semibold text-subText uppercase tracking-wider">
                <th className="py-3 px-4">Venda #</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Canal / Local</th>
                <th className="py-3 px-4">Valor Total</th>
                <th className="py-3 px-4">Lucro</th>
                <th className="py-3 px-4">Pagamento</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider/70 text-xs">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold font-heading text-mainText">
                    #{sale.number}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-mainText">
                    {sale.client_name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-gray-100 text-mainText font-medium px-2 py-0.5 rounded text-[11px]">
                      {sale.channel}
                    </span>
                    <span className="text-[11px] text-subText block mt-0.5">{sale.location}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold font-heading text-mainText">
                    R$ {sale.total.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[11px]">
                      + R$ {sale.profit.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-subText">
                    {sale.payment_method}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={sale.status === 'completed' ? 'success' : 'warning'}>
                      {sale.status === 'completed' ? 'Concluída' : 'Processando'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-subText">
                    {sale.sale_date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
