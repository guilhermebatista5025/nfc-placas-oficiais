import React, { useState } from 'react'
import {
  Users,
  Plus,
  Building,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ChevronRight,
  Cpu,
  Search
} from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { useNavigate } from 'react-router-dom'

export function Clients() {
  const { clients, plates, addClient, searchQuery } = useApp()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const navigate = useNavigate()

  // New Client form state
  const [name, setName] = useState('')
  const [responsibleName, setResponsibleName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [document, setDocument] = useState('')
  const [segment, setSegment] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('ES')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')

  const handleCreateClient = (e) => {
    e.preventDefault()
    if (!name) return

    addClient({
      name,
      responsible_name: responsibleName,
      email,
      phone,
      document,
      business_segment: segment || 'Comércio Geral',
      city: city || 'Vila Velha',
      state: state || 'ES',
      address,
      notes
    })

    setIsModalOpen(false)
    setName('')
    setResponsibleName('')
    setEmail('')
    setPhone('')
    setDocument('')
    setSegment('')
    setCity('')
    setAddress('')
    setNotes('')
  }

  const filteredClients = clients.filter(c => {
    const q = searchQuery.toLowerCase()
    return (
      !searchQuery ||
      c.name.toLowerCase().includes(q) ||
      (c.responsible_name && c.responsible_name.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q))
    )
  })

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-mainText">Clientes Cadastrados</h1>
          <p className="text-xs text-subText mt-1">
            Empresas, comércios e estabelecimentos com placas NFC e soluções de avaliações.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredClients.map((client, idx) => {
          const clientPlates = plates.filter(p => p.client_id === client.id)
          const activeCount = clientPlates.filter(p => p.status === 'active').length

          // Alternating pastel squircle colors like in Screen 4
          const squircleColors = [
            'bg-pastel-purple text-primary',
            'bg-pastel-orange text-amber-600',
            'bg-pastel-blue text-sky-600',
            'bg-pastel-green text-emerald-600'
          ]
          const colorClass = squircleColors[idx % squircleColors.length]

          return (
            <div
              key={client.id}
              onClick={() => navigate(`/app/clients/${client.id}`)}
              className="bg-white rounded-3xl border border-cardBorder p-4 sm:p-5 shadow-card hover:border-primary/50 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold font-heading text-base shrink-0 shadow-xs ${colorClass}`}>
                      {client.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-sm font-bold text-mainText group-hover:text-primary transition-colors truncate">
                        {client.name}
                      </h3>
                      <p className="text-[11px] text-subText truncate mt-0.5">
                        {client.responsible_name ? `${client.responsible_name} • ` : ''}{client.business_segment}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <ChevronRight className="w-4 h-4 text-subText group-hover:text-primary transition-colors" />
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-divider/80 flex items-center justify-between text-xs">
                  <span className="text-subText flex items-center gap-1.5 font-medium">
                    <Cpu className="w-3.5 h-3.5 text-primary" />
                    {clientPlates.length} {clientPlates.length === 1 ? 'placa' : 'placas'}
                  </span>
                  <span className="text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    {activeCount} ativas
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Cadastrar Cliente Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cadastrar Novo Cliente"
        description="Preencha os dados da empresa ou estabelecimento parceiro."
      >
        <form onSubmit={handleCreateClient} className="space-y-4">
          <Input
            label="Razão Social / Nome Fantasia *"
            placeholder="Ex: Restaurante Villa Gourmet"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Nome do Responsável"
              placeholder="Ex: Carlos Ferreira"
              value={responsibleName}
              onChange={(e) => setResponsibleName(e.target.value)}
            />
            <Input
              label="Segmento de Atuação"
              placeholder="Ex: Gastronomia, Estética..."
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Telefone / WhatsApp"
              placeholder="(27) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="CNPJ ou CPF"
              placeholder="00.000.000/0001-00"
              value={document}
              onChange={(e) => setDocument(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Cidade"
                placeholder="Ex: Vila Velha"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mainText mb-1.5">UF</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-xl border border-divider bg-white px-3.5 py-2.5 text-sm text-mainText focus:border-primary focus:outline-none"
              >
                <option value="ES">ES</option>
                <option value="RJ">RJ</option>
                <option value="SP">SP</option>
                <option value="MG">MG</option>
                <option value="BA">BA</option>
              </select>
            </div>
          </div>

          <Input
            label="Endereço Completo"
            placeholder="Rua, número, bairro..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Cadastrar Cliente
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
