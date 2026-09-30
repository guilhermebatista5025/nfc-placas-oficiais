import React, { useState } from 'react'
import { UserCheck, Plus, Shield, Mail, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

export function Team() {
  const [members, setMembers] = useState([
    { id: 1, name: 'Bruno Craft', email: 'bruno@craftevolution.com.br', role: 'owner', status: 'active' },
    { id: 2, name: 'Marcos Oliveira', email: 'marcos@craftevolution.com.br', role: 'admin', status: 'active' },
    { id: 3, name: 'Carolina Santos', email: 'carol@craftevolution.com.br', role: 'seller', status: 'active' },
    { id: 4, name: 'Felipe Rocha', email: 'felipe@craftevolution.com.br', role: 'operator', status: 'active' },
  ])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const roleLabels = {
    owner: { title: 'Owner', desc: 'Acesso total irrestrito à plataforma e faturamento' },
    admin: { title: 'Admin', desc: 'Administra operações, equipe e estoque' },
    seller: { title: 'Seller (Vendedor)', desc: 'Cadastra clientes, registra vendas e consulta estoque' },
    operator: { title: 'Operator', desc: 'Gravação de NFC, geração de QR codes e controle físico' },
    viewer: { title: 'Viewer', desc: 'Visualização de relatórios e dados em modo somente-leitura' }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-mainText">Equipe & Permissões</h1>
          <p className="text-xs text-subText mt-1">
            Controle de acessos baseado em perfis (RBAC) isolados por organização.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Convidar Membro
        </Button>
      </div>

      {/* Team Table */}
      <div className="bg-white rounded-card border border-cardBorder shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-divider bg-[#F8FAFC] text-[11px] font-semibold text-subText uppercase tracking-wider">
                <th className="py-3 px-4">Membro</th>
                <th className="py-3 px-4">Função (Role)</th>
                <th className="py-3 px-4">Permissões Principais</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider/70 text-xs">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-mainText block">{m.name}</span>
                        <span className="text-[11px] text-subText">{m.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-mainText uppercase text-[11px] bg-gray-100 px-2 py-0.5 rounded">
                      {m.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-subText">
                    {roleLabels[m.role]?.desc}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                      Ativo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Convidar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Convidar Novo Membro da Equipe"
        description="O convidado receberá um e-mail com instruções para ativar seu login."
      >
        <form onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }} className="space-y-4">
          <Input label="Nome Completo" placeholder="Ex: Lucas Silva" required />
          <Input label="E-mail Corporativo" type="email" placeholder="lucas@craftevolution.com.br" required />
          <div>
            <label className="block text-xs font-semibold text-mainText mb-1.5">Perfil de Acesso</label>
            <select className="w-full rounded-xl border border-divider bg-white px-3.5 py-2.5 text-sm text-mainText focus:border-primary focus:outline-none">
              <option value="seller">Seller (Vendas & Clientes)</option>
              <option value="operator">Operator (Placas, QR & Estoque)</option>
              <option value="admin">Admin (Gestão Geral)</option>
              <option value="viewer">Viewer (Somente Leitura)</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary">Enviar Convite</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
