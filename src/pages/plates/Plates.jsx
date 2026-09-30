import React, { useState } from 'react'
import {
  Cpu,
  Plus,
  QrCode,
  ExternalLink,
  Edit,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Search,
  Filter
} from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { Badge, plateStatusConfig } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

export function Plates() {
  const { plates, clients, products, addPlate, updatePlate, searchQuery } = useApp()
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedPlate, setSelectedPlate] = useState(null)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [isNewPlateModalOpen, setIsNewPlateModalOpen] = useState(false)
  const [copiedCode, setCopiedCode] = useState(null)

  // Form states for configuration modal
  const [editStatus, setEditStatus] = useState('')
  const [editGoogleUrl, setEditGoogleUrl] = useState('')
  const [editClientId, setEditClientId] = useState('')

  // Form states for new plate modal
  const [newCode, setNewCode] = useState('')
  const [newSerial, setNewSerial] = useState('')
  const [newProductId, setNewProductId] = useState('')

  const handleOpenConfig = (plate) => {
    setSelectedPlate(plate)
    setEditStatus(plate.status)
    setEditGoogleUrl(plate.google_review_url || '')
    setEditClientId(plate.client_id || '')
    setIsConfigModalOpen(true)
  }

  const handleSaveConfig = (e) => {
    e.preventDefault()
    if (!selectedPlate) return

    const selectedClient = clients.find(c => c.id === editClientId)

    updatePlate(selectedPlate.id, {
      status: editStatus,
      google_review_url: editGoogleUrl,
      client_id: editClientId || null,
      client_name: selectedClient ? selectedClient.name : null
    })

    setIsConfigModalOpen(false)
  }

  const handleCreatePlate = (e) => {
    e.preventDefault()
    const product = products.find(p => p.id === newProductId) || products[0]

    addPlate({
      code: newCode || `NFC-${String(plates.length + 1).padStart(6, '0')}`,
      serial_number: newSerial || `SN-NFC-${Math.floor(10000 + Math.random() * 90000)}`,
      product_name: product?.name || 'Placa NFC Padrão',
      status: 'in_stock',
      google_review_url: '',
      client_name: null,
      client_id: null
    })

    setIsNewPlateModalOpen(false)
    setNewCode('')
    setNewSerial('')
  }

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const filteredPlates = plates.filter(p => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      !searchQuery ||
      p.code.toLowerCase().includes(query) ||
      (p.client_name && p.client_name.toLowerCase().includes(query)) ||
      (p.product_name && p.product_name.toLowerCase().includes(query))
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-mainText">Gerenciamento de Placas NFC</h1>
          <p className="text-xs text-subText mt-1">
            Controle de seriais, vínculo com avaliações Google Reviews e ativação em clientes.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsNewPlateModalOpen(true)}
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Placa NFC
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-divider">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-2 text-xs font-semibold rounded-xl transition-colors shrink-0 ${
            statusFilter === 'all'
              ? 'bg-primary text-white'
              : 'text-subText hover:text-mainText hover:bg-gray-100'
          }`}
        >
          Todas ({plates.length})
        </button>
        {Object.entries(plateStatusConfig).map(([statusKey, config]) => {
          const count = plates.filter(p => p.status === statusKey).length
          return (
            <button
              key={statusKey}
              onClick={() => setStatusFilter(statusKey)}
              className={`px-3 py-2 text-xs font-medium rounded-xl transition-colors shrink-0 flex items-center gap-1.5 ${
                statusFilter === statusKey
                  ? 'bg-white border border-cardBorder text-mainText shadow-sm'
                  : 'text-subText hover:text-mainText hover:bg-gray-100'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${config.dotColor}`} />
              {config.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Mobile Cards View (sm:hidden) */}
      <div className="space-y-3 sm:hidden">
        {filteredPlates.length === 0 ? (
          <div className="bg-white rounded-3xl border border-cardBorder p-8 text-center text-xs text-subText">
            Nenhuma placa NFC encontrada para o filtro atual.
          </div>
        ) : (
          filteredPlates.map((plate) => (
            <div
              key={plate.id}
              className="bg-white rounded-3xl border border-cardBorder p-4.5 shadow-card space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-pastel-purple text-primary flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-sm text-mainText">{plate.code}</span>
                      <button
                        onClick={() => handleCopy(plate.code, plate.id)}
                        className="text-subText hover:text-mainText p-0.5"
                        title="Copiar código"
                      >
                        {copiedCode === plate.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <span className="text-[11px] text-subText font-mono block">{plate.serial_number}</span>
                  </div>
                </div>
                <Badge status={plate.status} />
              </div>

              <div className="bg-[#F8F9FE] p-2.5 rounded-2xl space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-subText">Produto:</span>
                  <span className="font-medium text-mainText">{plate.product_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-subText">Cliente:</span>
                  <span className="font-semibold text-mainText">
                    {plate.client_name || <em className="text-subText font-normal">Disponível no Estoque</em>}
                  </span>
                </div>
              </div>

              {/* Google URL status */}
              <div className="pt-1 flex items-center justify-between gap-2">
                {plate.google_review_url ? (
                  <a
                    href={plate.google_review_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline text-[11px] font-semibold flex items-center gap-1 truncate max-w-[190px]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">URL Configurada</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <span className="text-amber-600 text-[11px] font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Sem URL Google
                  </span>
                )}

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenConfig(plate)}
                  className="text-xs py-1.5 px-3 h-auto rounded-xl"
                >
                  <Edit className="w-3.5 h-3.5 mr-1" />
                  Configurar
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Plates Table (hidden sm:block) */}
      <div className="hidden sm:block bg-white rounded-card border border-cardBorder shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-divider bg-[#F8FAFC] text-[11px] font-semibold text-subText uppercase tracking-wider">
                <th className="py-3 px-4">Código / Serial</th>
                <th className="py-3 px-4">Produto</th>
                <th className="py-3 px-4">Cliente Vinculado</th>
                <th className="py-3 px-4">Destino Google Reviews</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider/70 text-xs">
              {filteredPlates.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-subText">
                    Nenhuma placa NFC encontrada para o filtro atual.
                  </td>
                </tr>
              ) : (
                filteredPlates.map((plate) => (
                  <tr key={plate.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Código / Serial */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-mainText text-xs">{plate.code}</span>
                        <button
                          onClick={() => handleCopy(plate.code, plate.id)}
                          className="text-subText hover:text-mainText p-1"
                          title="Copiar código"
                        >
                          {copiedCode === plate.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <span className="text-[11px] text-subText font-mono">{plate.serial_number}</span>
                    </td>

                    {/* Produto */}
                    <td className="py-3.5 px-4 font-medium text-mainText">
                      {plate.product_name}
                    </td>

                    {/* Cliente */}
                    <td className="py-3.5 px-4">
                      {plate.client_name ? (
                        <span className="font-semibold text-mainText">{plate.client_name}</span>
                      ) : (
                        <span className="text-subText italic text-[11px]">Nenhum cliente (Estoque)</span>
                      )}
                    </td>

                    {/* URL Google Reviews */}
                    <td className="py-3.5 px-4 max-w-xs">
                      {plate.google_review_url ? (
                        <a
                          href={plate.google_review_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline font-mono text-[11px] flex items-center gap-1 truncate"
                        >
                          <span className="truncate">{plate.google_review_url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                          <AlertCircle className="w-3 h-3" /> Aguardando URL
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <Badge status={plate.status} />
                    </td>

                    {/* Ações */}
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenConfig(plate)}
                        className="text-xs py-1 px-2.5 h-auto"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        Configurar
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configuração da Placa Modal */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        title={`Configurar Placa ${selectedPlate?.code}`}
        description="Atualize o status, vincule o cliente e informe a URL oficial de avaliação no Google."
      >
        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-mainText mb-1.5">Status da Placa</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="w-full rounded-xl border border-divider bg-white px-3.5 py-2.5 text-sm text-mainText focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="in_stock">Em estoque</option>
              <option value="reserved">Reservada</option>
              <option value="sold">Vendida</option>
              <option value="configuring">Configurando</option>
              <option value="active">Ativa (Entregue e Funcionando)</option>
              <option value="disabled">Desativada</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-mainText mb-1.5">Cliente Destino</label>
            <select
              value={editClientId}
              onChange={(e) => setEditClientId(e.target.value)}
              className="w-full rounded-xl border border-divider bg-white px-3.5 py-2.5 text-sm text-mainText focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Nenhum cliente (Em Estoque)</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <Input
            label="Google Review URL (Link direto de avaliação)"
            placeholder="https://g.page/r/ExemploEmpresa/review"
            value={editGoogleUrl}
            onChange={(e) => setEditGoogleUrl(e.target.value)}
          />

          {/* QR Code Preview Box */}
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-cardBorder">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white border border-cardBorder rounded-lg p-1 flex items-center justify-center">
                <QrCode className="w-10 h-10 text-primary" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-mainText">Redirecionamento Inteligente</p>
                <p className="text-[11px] text-subText font-mono truncate">
                  {selectedPlate?.qr_code_url}
                </p>
                <p className="text-[10px] text-emerald-600 mt-1 font-medium">
                  {editGoogleUrl ? '● Pronto para gravar no chip NFC e gerar QR' : '○ Insira a URL acima'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsConfigModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cadastrar Nova Placa Modal */}
      <Modal
        isOpen={isNewPlateModalOpen}
        onClose={() => setIsNewPlateModalOpen(false)}
        title="Cadastrar Nova Placa NFC"
        description="Gere um identificador único para o novo lote de placas no estoque."
      >
        <form onSubmit={handleCreatePlate} className="space-y-4">
          <Input
            label="Código Identificador (Ex: NFC-000007)"
            placeholder={`NFC-${String(plates.length + 1).padStart(6, '0')}`}
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
          />

          <Input
            label="Número de Série (Hardware / Chip)"
            placeholder="Ex: SN-NFC-99412"
            value={newSerial}
            onChange={(e) => setNewSerial(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-mainText mb-1.5">Modelo do Produto</label>
            <select
              value={newProductId}
              onChange={(e) => setNewProductId(e.target.value)}
              className="w-full rounded-xl border border-divider bg-white px-3.5 py-2.5 text-sm text-mainText focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (R$ {p.sale_price.toFixed(2)})</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsNewPlateModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Cadastrar no Estoque
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
