import React, { useState } from 'react'
import { Building, Database, Save, Check } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function Settings() {
  const { organization, setOrganization } = useApp()
  const { isSupabaseConfigured } = useAuth()
  const [name, setName] = useState(organization?.name || 'Craft Evolution')
  const [email, setEmail] = useState(organization?.email || 'contato@craftevolution.com.br')
  const [phone, setPhone] = useState(organization?.phone || '(27) 99876-5432')
  const [saved, setSaved] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      await setOrganization({ name, email, phone })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (error) {
      window.alert(error.message || 'Não foi possível salvar a organização.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-mainText">Configurações da Organização</h1>
        <p className="text-xs text-subText mt-1">
          Identidade do tenant multi-tenant, parâmetros operacionais e status do Supabase.
        </p>
      </div>

      {/* Org Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-card border border-cardBorder p-6 shadow-card space-y-4">
        <h2 className="text-sm font-bold text-mainText pb-2 border-b border-divider flex items-center gap-2">
          <Building className="w-4 h-4 text-primary" />
          Dados da Empresa (Tenant)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Razão Social / Nome da Empresa"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Slug do Ambiente"
            value={organization?.slug || 'craft-evolution'}
            disabled
            className="bg-gray-50 text-subText font-mono"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="E-mail Operacional"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Telefone / Contato Comercial"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" className="gap-2">
            {saved ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
            {saved ? 'Salvo com Sucesso' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>

      {/* Supabase Status Card */}
      <div className="bg-white rounded-card border border-cardBorder p-6 shadow-card space-y-3">
        <h2 className="text-sm font-bold text-mainText pb-2 border-b border-divider flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          Conexão Backend (Supabase PostgreSQL & Auth)
        </h2>

        <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-cardBorder text-xs">
          <div>
            <p className="font-semibold text-mainText">Status do Supabase</p>
            <p className="text-subText text-[11px] mt-0.5">
              {isSupabaseConfigured
                ? 'Conectado diretamente ao projeto Supabase remoto.'
                : 'Modo demonstração somente em memória. Configure o .env para persistir no Supabase.'}
            </p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
            isSupabaseConfigured
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-blue-50 text-blue-700'
          }`}>
            {isSupabaseConfigured ? 'Conectado Remoto' : 'Sem persistência'}
          </span>
        </div>

        <div className="text-xs text-subText space-y-1">
          <p>• Multi-tenant: Isolamento garantido por <code>organization_id</code> em todas as queries.</p>
          <p>• Secrets: Nenhuma chave restrita (como <code>service_role_key</code>) exposta no bundle cliente.</p>
        </div>
      </div>
    </div>
  )
}
