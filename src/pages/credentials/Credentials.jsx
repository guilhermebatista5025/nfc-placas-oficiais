import React, { useState } from 'react'
import { KeyRound, Plus, ShieldCheck, Lock, Eye, EyeOff, Building, AlertTriangle } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

export function Credentials() {
  const { credentials, clients } = useApp()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [revealed, setRevealed] = useState({})

  const toggleReveal = (id) => {
    setRevealed(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-mainText">Cofre de Credenciais</h1>
          <p className="text-xs text-subText mt-1">
            Armazenamento criptografado de contas Google Business, chaves de API e tokens dos clientes.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Nova Credencial
        </Button>
      </div>

      {/* Security Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900">
          <p className="font-bold">Proteção de Nível Bancário & Supabase RLS</p>
          <p className="mt-0.5 text-blue-700">
            Nenhuma senha ou segredo é gravado em texto puro. Todos os acessos passam por funções Edge criptografadas com chave mestra e auditoria de visualização.
          </p>
        </div>
      </div>

      {/* Credentials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {credentials.map((cred) => (
          <div
            key={cred.id}
            className="bg-white rounded-card border border-cardBorder p-5 shadow-card space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-divider">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-mainText">{cred.service}</h3>
                  <span className="text-[11px] text-subText font-medium">{cred.client_name}</span>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Ativo & Protegido
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-subText block text-[11px]">Identificador / E-mail</span>
                <span className="font-mono text-mainText font-semibold">{cred.username}</span>
              </div>

              <div>
                <span className="text-subText block text-[11px]">Chave Secreta Criptografada</span>
                <div className="flex items-center justify-between bg-[#F8FAFC] px-3 py-2 rounded-xl border border-cardBorder font-mono mt-1">
                  <span>{revealed[cred.id] ? 'sec_live_9941_x9f812a_auth' : '••••••••••••••••••••••••'}</span>
                  <button
                    onClick={() => toggleReveal(cred.id)}
                    className="text-subText hover:text-mainText ml-2 p-1"
                    title={revealed[cred.id] ? "Ocultar" : "Visualizar com auditoria"}
                  >
                    {revealed[cred.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {cred.notes && (
                <p className="text-[11px] text-subText mt-1 italic">
                  Obs: {cred.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nova Credencial */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cadastrar Credencial Segura"
        description="O segredo será criptografado imediatamente antes de ser salvo."
      >
        <form onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-mainText mb-1.5">Cliente</label>
            <select className="w-full rounded-xl border border-divider bg-white px-3.5 py-2.5 text-sm text-mainText focus:border-primary focus:outline-none">
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <Input label="Serviço ou API" placeholder="Ex: Google Business Profile, Place API" required />
          <Input label="Identificador / E-mail de Login" placeholder="exemplo@gmail.com" required />
          <Input label="Chave Secreta / Senha" type="password" placeholder="••••••••••••" required />
          <Input label="Observações de Uso" placeholder="Informações relevantes sobre a chave..." />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary">Criptografar e Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
