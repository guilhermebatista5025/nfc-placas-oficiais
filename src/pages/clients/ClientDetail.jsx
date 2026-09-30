import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Building,
  Phone,
  Mail,
  MapPin,
  Cpu,
  ShoppingCart,
  KeyRound,
  History,
  FileText,
  ExternalLink,
  Plus
} from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { clients, plates, sales, credentials } = useApp()
  const [activeTab, setActiveTab] = useState('info') // info, plates, sales, credentials, history

  const client = clients.find(c => c.id === id) || clients[0]
  const clientPlates = plates.filter(p => p.client_id === client?.id)
  const clientSales = sales.filter(s => s.client_id === client?.id)
  const clientCredentials = credentials.filter(c => c.client_id === client?.id)

  if (!client) {
    return (
      <div className="text-center py-16">
        <p className="text-subText">Cliente não encontrado.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/app/clients')}>
          Voltar para Clientes
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app/clients')}
            className="p-2 rounded-xl bg-white border border-cardBorder text-subText hover:text-mainText hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-heading text-mainText">{client.name}</h1>
              <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
                {client.business_segment}
              </span>
            </div>
            <p className="text-xs text-subText mt-0.5">
              {client.responsible_name} • {client.city} - {client.state}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-divider flex items-center gap-2 overflow-x-auto pb-0.5">
        {[
          { id: 'info', label: 'Informações', icon: FileText },
          { id: 'plates', label: `Placas NFC (${clientPlates.length})`, icon: Cpu },
          { id: 'sales', label: `Vendas (${clientSales.length})`, icon: ShoppingCart },
          { id: 'credentials', label: `Credenciais (${clientCredentials.length})`, icon: KeyRound },
          { id: 'history', label: 'Histórico', icon: History }
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 shrink-0 ${
                isActive
                  ? 'border-primary text-primary bg-white shadow-xs'
                  : 'border-transparent text-subText hover:text-mainText hover:bg-gray-100/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-card border border-cardBorder p-6 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-mainText pb-2 border-b border-divider">Dados Cadastrais</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-subText block">Responsável</span>
                <span className="font-semibold text-mainText">{client.responsible_name || 'Não informado'}</span>
              </div>
              <div>
                <span className="text-subText block">CNPJ/CPF</span>
                <span className="font-semibold text-mainText">{client.document || 'Não informado'}</span>
              </div>
              <div>
                <span className="text-subText block">Telefone / WhatsApp</span>
                <span className="font-semibold text-mainText">{client.phone || 'Não informado'}</span>
              </div>
              <div>
                <span className="text-subText block">E-mail</span>
                <span className="font-semibold text-mainText">{client.email || 'Não informado'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-card border border-cardBorder p-6 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-mainText pb-2 border-b border-divider">Endereço & Notas</h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-subText block">Endereço de Entrega / Instalação</span>
                <span className="font-semibold text-mainText">{client.address || 'Não cadastrado'}</span>
              </div>
              <div>
                <span className="text-subText block">Cidade / Estado</span>
                <span className="font-semibold text-mainText">{client.city} - {client.state}</span>
              </div>
              <div>
                <span className="text-subText block">Observações Operacionais</span>
                <p className="mt-1 text-mainText bg-[#F8FAFC] p-3 rounded-xl border border-cardBorder">
                  {client.notes || 'Sem observações adicionais.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'plates' && (
        <div className="bg-white rounded-card border border-cardBorder shadow-card overflow-hidden">
          <div className="p-4 border-b border-divider flex items-center justify-between">
            <span className="text-xs font-bold text-mainText">Placas NFC em Operação</span>
            <Button size="sm" onClick={() => navigate('/app/plates')}>Ir para Placas</Button>
          </div>
          <div className="divide-y divide-divider/70">
            {clientPlates.length === 0 ? (
              <div className="p-8 text-center text-xs text-subText">Nenhuma placa associada a este cliente.</div>
            ) : (
              clientPlates.map(p => (
                <div key={p.id} className="p-4 flex items-center justify-between text-xs hover:bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-mainText">{p.code}</span>
                    <span className="text-subText">• {p.product_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {p.google_review_url && (
                      <a href={p.google_review_url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs flex items-center gap-1">
                        URL Avaliação <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <Badge status={p.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'sales' && (
        <div className="bg-white rounded-card border border-cardBorder shadow-card overflow-hidden">
          <div className="p-4 border-b border-divider flex items-center justify-between">
            <span className="text-xs font-bold text-mainText">Histórico de Compras</span>
          </div>
          <div className="divide-y divide-divider/70">
            {clientSales.length === 0 ? (
              <div className="p-8 text-center text-xs text-subText">Nenhuma compra registrada para este cliente.</div>
            ) : (
              clientSales.map(s => (
                <div key={s.id} className="p-4 flex items-center justify-between text-xs hover:bg-gray-50/50">
                  <div>
                    <span className="font-bold text-mainText">Venda #{s.number}</span>
                    <span className="text-subText ml-2">({s.sale_date}) • Canal: {s.channel}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold font-heading text-mainText">R$ {s.total.toFixed(2)}</span>
                    <span className="ml-2 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                      {s.payment_method}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'credentials' && (
        <div className="bg-white rounded-card border border-cardBorder p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-divider">
            <div>
              <h3 className="text-sm font-bold text-mainText">Credenciais & Acessos Google</h3>
              <p className="text-xs text-subText">Acessos criptografados para monitoramento do Google Place</p>
            </div>
            <Button size="sm" onClick={() => navigate('/app/credentials')}>Gerenciar</Button>
          </div>
          <div className="space-y-3">
            {clientCredentials.length === 0 ? (
              <p className="text-xs text-subText py-4 text-center">Nenhuma credencial configurada.</p>
            ) : (
              clientCredentials.map(c => (
                <div key={c.id} className="p-3 bg-[#F8FAFC] rounded-xl border border-cardBorder flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-mainText block">{c.service}</span>
                    <span className="text-subText font-mono text-[11px]">{c.username}</span>
                  </div>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                    Criptografado
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-card border border-cardBorder p-6 shadow-card">
          <h3 className="text-sm font-bold text-mainText pb-3 border-b border-divider">Timeline de Eventos</h3>
          <div className="mt-4 space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-divider">
            <div className="relative pl-8 text-xs">
              <span className="absolute left-1.5 top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-white"></span>
              <p className="font-bold text-mainText">Placas NFC ativadas no Google Reviews</p>
              <p className="text-subText text-[11px]">2026-02-18 • Placa NFC-000001 e NFC-000002 configuradas</p>
            </div>
            <div className="relative pl-8 text-xs">
              <span className="absolute left-1.5 top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white"></span>
              <p className="font-bold text-mainText">Venda #00053 finalizada via WhatsApp</p>
              <p className="text-subText text-[11px]">2026-02-15 • Pagamento via Pix aprovado</p>
            </div>
            <div className="relative pl-8 text-xs">
              <span className="absolute left-1.5 top-1 w-3 h-3 rounded-full bg-gray-400 ring-4 ring-white"></span>
              <p className="font-bold text-mainText">Cadastro do Cliente Realizado</p>
              <p className="text-subText text-[11px]">2026-02-15 • Estabelecimento cadastrado no SaaS</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
