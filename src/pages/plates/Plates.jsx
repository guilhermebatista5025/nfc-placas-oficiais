import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Copy, Filter, Link2, MapPin, Nfc, Pencil, Plus, QrCode, Save, ScanLine, Search, Settings2, UserRound, X } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { EmptyMobile, MobileHeader, MobilePage, StatusPill } from '@/components/mobile/MobileUI'
import { getNfcMessage, isWebNfcAvailable, nfcErrorMessage, writeNfcUrl } from '@/services/webNfc'

const filters = [{ key: 'all', label: 'Todas' }, { key: 'active', label: 'Ativas' }, { key: 'configuring', label: 'Configurando' }, { key: 'in_stock', label: 'Estoque' }]
const statusMap = { active: ['Ativa', 'green'], configuring: ['Configurando', 'amber'], in_stock: ['Em estoque', 'blue'], sold: ['Vendida', 'slate'], reserved: ['Reservada', 'amber'], disabled: ['Desativada', 'rose'] }

export function Plates() {
  const navigate = useNavigate()
  const { plates, clients, updatePlate } = useApp()
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [qrPlate, setQrPlate] = useState(null)
  const [configuringPlate, setConfiguringPlate] = useState(null)
  const [form, setForm] = useState({ code: '', serial_number: '', client_id: '', google_review_url: '', status: 'configuring' })
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [nfcAvailable] = useState(() => isWebNfcAvailable())
  const [nfcReading, setNfcReading] = useState(false)
  const [nfcWritingId, setNfcWritingId] = useState('')
  const [nfcMessage, setNfcMessage] = useState(() => isWebNfcAvailable() ? 'Pronto para ler ou gravar uma etiqueta NDEF.' : 'Para usar NFC, abra o site em HTTPS no Chrome de um celular Android com NFC.')
  const [nfcError, setNfcError] = useState('')
  const [lastRead, setLastRead] = useState(null)
  const [verifyTarget, setVerifyTarget] = useState(null)
  const nfcController = useRef(null)
  const visible = useMemo(() => plates.filter((plate) => (filter === 'all' || plate.status === filter) && `${plate.code} ${plate.client_name || ''} ${plate.product_name}`.toLowerCase().includes(query.toLowerCase())), [plates, filter, query])

  const openConfiguration = (plate) => {
    setConfiguringPlate(plate)
    setSaved(false)
    setForm({ code: plate.code || '', serial_number: plate.serial_number || '', client_id: plate.client_id || '', google_review_url: plate.google_review_url || '', status: plate.status || 'configuring' })
  }

  const publicPlateUrl = (plate) => {
    const configuredBase = import.meta.env.VITE_PUBLIC_APP_URL
    const base = configuredBase || (import.meta.env.PROD ? window.location.origin : 'https://craftevolution-nfc.vercel.app')
    return new URL(`/api/plates/redirect/${encodeURIComponent(plate.id)}`, base).href
  }

  const stopNfcRead = (message = 'Leitura NFC encerrada.') => {
    nfcController.current?.abort()
    nfcController.current = null
    setNfcReading(false)
    setNfcMessage(message)
  }

  const startNfcRead = (expected = null) => {
    if (!nfcAvailable) {
      setNfcError('A leitura NFC exige Chrome em Android, NFC ativado e uma conexão HTTPS.')
      return
    }

    nfcController.current?.abort()
    const controller = new AbortController()
    nfcController.current = controller
    const reader = new window.NDEFReader()
    setNfcError('')
    setNfcReading(true)
    setNfcMessage(expected ? 'Aproxime a etiqueta que acabou de gravar para verificar.' : 'Aproxime a placa NFC da parte traseira do celular.')

    reader.addEventListener('reading', (event) => {
      const content = getNfcMessage(event)
      const dynamicPlateId = content.urls.map((value) => {
        try {
          return new URL(value).pathname.match(/^\/api\/plates\/redirect\/([^/]+)$/)?.[1] || ''
        } catch {
          return ''
        }
      }).find(Boolean)
      const serial = normalizeSerial(content.serialNumber)
      const matchedPlate = plates.find((plate) => (
        (dynamicPlateId && dynamicPlateId === `${plate.id}`)
        || (serial && normalizeSerial(plate.serial_number) === serial)
        || content.urls.includes(publicPlateUrl(plate))
      ))
      setLastRead(content)

      if (expected) {
        const verified = content.urls.includes(expected.url)
        setNfcMessage(verified ? `Gravação verificada: ${expected.code}.` : 'Etiqueta lida, mas o link não corresponde à placa selecionada.')
        setNfcError(verified ? '' : `Link encontrado: ${content.urls[0] || 'nenhum link NDEF'}`)
        if (verified) setVerifyTarget(null)
      } else {
        setNfcMessage(matchedPlate ? `Placa ${matchedPlate.code} identificada.` : 'Etiqueta lida. Confira o conteúdo abaixo e vincule-a à placa correta.')
        setNfcError('')
        if (matchedPlate) {
          openConfiguration({ ...matchedPlate, serial_number: content.serialNumber || matchedPlate.serial_number })
        }
      }

      controller.abort()
      if (nfcController.current === controller) nfcController.current = null
      setNfcReading(false)
    }, { once: true })

    reader.addEventListener('readingerror', () => {
      setNfcError('A etiqueta não pôde ser lida. Aproxime novamente ou tente outra etiqueta compatível com NDEF.')
    })
    reader.scan({ signal: controller.signal }).catch((error) => {
      if (controller.signal.aborted) return
      setNfcError(nfcErrorMessage(error))
      setNfcReading(false)
      nfcController.current = null
    })
  }

  const writePlateNfc = async (plate) => {
    if (!plate.google_review_url) {
      setNfcError('Configure primeiro o link de destino desta placa.')
      return
    }
    if (plate.status === 'disabled') {
      setNfcError('Ative a placa antes de gravar o link NFC.')
      return
    }

    const url = publicPlateUrl(plate)
    setNfcWritingId(plate.id)
    setNfcError('')
    setVerifyTarget(null)
    setNfcMessage(`Aproxime a etiqueta NFC para gravar ${plate.code}.`)
    try {
      await writeNfcUrl(url)
      setVerifyTarget({ id: plate.id, code: plate.code, url })
      setNfcMessage(`Link dinâmico gravado em ${plate.code}. Use “Verificar gravação” para confirmar.`)
      try {
        await updatePlate(plate.id, { status: 'active', qr_code_url: url })
      } catch {
        setNfcError('A etiqueta foi gravada, mas não consegui atualizar o status da placa. Salve a configuração e tente novamente.')
      }
    } catch (error) {
      setNfcError(nfcErrorMessage(error))
      setNfcMessage('A gravação não foi concluída.')
    } finally {
      setNfcWritingId('')
    }
  }

  useEffect(() => () => nfcController.current?.abort(), [])

  const saveConfiguration = async (event) => {
    event.preventDefault()
    try {
      await updatePlate(configuringPlate.id, { ...form, client_id: form.client_id || null, qr_code_url: publicPlateUrl(configuringPlate) })
      setSaved(true)
      setTimeout(() => setConfiguringPlate(null), 650)
    } catch (error) {
      window.alert(error.message || 'Não foi possível salvar a placa.')
    }
  }
  const copyLink = async (plate) => {
    await navigator.clipboard?.writeText(publicPlateUrl(plate))
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <MobilePage>
      <MobileHeader title="Gestão de placas" subtitle={`${plates.length} dispositivos`} actions={<button type="button" className="mobile-icon-button" aria-label="Filtros"><Filter size={19} /></button>} />
      <div className="relative mt-2"><Search className="absolute left-4 top-3.5 text-slate-400" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar placa, cliente ou código" className="w-full rounded-2xl border border-slate-100 bg-white py-3.5 pl-11 pr-12 text-xs font-semibold shadow-sm outline-none focus:border-blue-400" /><button type="button" onClick={() => startNfcRead()} disabled={!nfcAvailable || nfcReading} aria-label="Ler placa NFC" title="Ler placa NFC" className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white disabled:opacity-40"><ScanLine size={18} /></button></div>
      <div className="my-4 flex gap-2 overflow-x-auto pb-1">{filters.map((item) => <button key={item.key} type="button" onClick={() => setFilter(item.key)} className={`shrink-0 rounded-full px-4 py-2.5 text-[10px] font-extrabold ${filter === item.key ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-white text-slate-500 ring-1 ring-slate-100'}`}>{item.label}</button>)}</div>

      <section className="relative mb-5 overflow-hidden rounded-[26px] bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 p-5 text-white">
        <div className="absolute -right-6 -top-10 h-32 w-32 rounded-full bg-blue-500/30 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15"><Nfc size={26} /></span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <strong className="text-sm text-white">{nfcAvailable ? nfcReading ? 'Aproxime a etiqueta' : 'Web NFC pronto' : 'Web NFC nao disponivel neste aparelho'}</strong>
                <span className={`h-2 w-2 rounded-full ${nfcAvailable ? nfcReading ? 'animate-pulse bg-amber-300' : 'bg-emerald-400' : 'bg-slate-500'}`} />
              </div>
              <p role="status" className="mt-1 text-[10px] text-blue-200">{nfcMessage}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => startNfcRead()} disabled={!nfcAvailable || nfcReading || Boolean(nfcWritingId)} className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2.5 text-[10px] font-extrabold text-white ring-1 ring-white/15 disabled:opacity-45"><ScanLine size={14} /> Ler etiqueta</button>
            {nfcReading && <button type="button" onClick={() => stopNfcRead()} className="rounded-xl bg-white/10 px-3 py-2.5 text-[10px] font-bold text-white ring-1 ring-white/15">Parar leitura</button>}
            {verifyTarget && <button type="button" onClick={() => startNfcRead(verifyTarget)} disabled={nfcReading} className="flex items-center gap-2 rounded-xl bg-emerald-400 px-3 py-2.5 text-[10px] font-extrabold text-slate-950 disabled:opacity-45"><Check size={14} /> Verificar grava??o</button>}
          </div>
          {nfcError && <p role="alert" className="mt-3 rounded-xl bg-rose-400/15 px-3 py-2 text-[10px] font-semibold text-rose-100 ring-1 ring-rose-200/20">{nfcError}</p>}
          {lastRead && <div className="mt-3 rounded-xl bg-white/10 p-3 text-[10px] ring-1 ring-white/10"><p className="font-bold text-white">Etiqueta lida</p><p className="mt-1 break-all text-blue-100">Serial: {lastRead.serialNumber || 'nao informado'}</p><p className="mt-1 break-all text-blue-100">Link: {lastRead.urls[0] || lastRead.texts[0] || 'sem registro de texto ou URL'}</p></div>}
        </div>
      </section>

      <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-extrabold">Suas placas</h2><span className="text-[10px] font-bold text-slate-400">{visible.length} resultados</span></div>
      <div className="space-y-3">
        {visible.length ? visible.map((plate) => {
          const [label, tone] = statusMap[plate.status] || statusMap.in_stock
          return (
            <article key={plate.id} className="mobile-card overflow-hidden p-4">
              <div className="flex items-start gap-3"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Nfc size={23} /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><strong className="block truncate text-xs text-slate-900">{plate.client_name || 'Placa sem cliente'}</strong><p className="mt-1 truncate text-[10px] text-slate-400">{plate.product_name}</p></div><StatusPill tone={tone}>{label}</StatusPill></div><p className="mt-2 font-mono text-[10px] font-bold text-slate-500">{plate.code} • {plate.serial_number}</p></div></div>
              <div className={`mt-3 rounded-2xl p-3 ${plate.google_review_url ? 'bg-slate-50' : 'bg-amber-50'}`}><p className={`truncate text-[10px] font-semibold ${plate.google_review_url ? 'text-slate-500' : 'text-amber-700'}`}>{plate.google_review_url || 'Aguardando URL do Google Maps / Instagram'}</p></div>
              <div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={() => setQrPlate(plate)} className="flex items-center justify-center gap-1 rounded-xl bg-blue-600 py-2.5 text-[10px] font-bold text-white"><QrCode size={14} /> Ver QR Code</button><button type="button" onClick={() => openConfiguration(plate)} className="flex items-center justify-center gap-1 rounded-xl bg-slate-100 py-2.5 text-[10px] font-bold text-slate-600"><Settings2 size={14} /> Configurar</button></div><button type="button" onClick={() => writePlateNfc(plate)} disabled={!nfcAvailable || !plate.google_review_url || nfcReading || Boolean(nfcWritingId)} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-50 py-2.5 text-[10px] font-extrabold text-indigo-700 disabled:cursor-not-allowed disabled:opacity-45"><Nfc size={15} /> {nfcWritingId === plate.id ? 'Aproxime a etiqueta para gravar' : plate.google_review_url ? plate.status === 'active' ? 'Regravar NFC' : 'Gravar NFC' : 'Configure o link antes'}</button>
            </article>
          )
        }) : <EmptyMobile>Nenhuma placa encontrada.</EmptyMobile>}
      </div>

      <div className="mt-5 grid grid-cols-3 divide-x divide-slate-100 rounded-2xl bg-white p-4 text-center shadow-sm"><div><strong className="block text-lg text-blue-600">{plates.filter((p) => p.status === 'active').length}</strong><span className="text-[9px] text-slate-400">Ativas</span></div><div><strong className="block text-lg text-amber-500">{plates.filter((p) => p.status === 'configuring').length}</strong><span className="text-[9px] text-slate-400">Configurando</span></div><div><strong className="block text-lg text-sky-500">{plates.filter((p) => p.status === 'in_stock').length}</strong><span className="text-[9px] text-slate-400">Estoque</span></div></div>
      <button type="button" onClick={() => navigate('/app/inventory')} className="fixed bottom-24 right-5 z-20 grid h-14 w-14 place-items-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-300"><Plus size={24} /></button>

      {configuringPlate && (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-950/55 p-3 backdrop-blur-sm" onClick={() => setConfiguringPlate(null)}>
          <form onSubmit={saveConfiguration} className="mx-auto max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-[28px] bg-white p-5" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between"><div><h2 className="text-base font-extrabold">Configurar placa</h2><p className="text-[10px] text-slate-400">Edite o identificador e o destino da placa</p></div><button type="button" onClick={() => setConfiguringPlate(null)} className="mobile-icon-button"><X size={18} /></button></div>
            <div className="mt-5 space-y-4">
              <label className="block"><span className="text-[10px] font-extrabold text-slate-600">Número da placa</span><div className="relative mt-1"><Pencil size={15} className="absolute left-3 top-3.5 text-slate-400" /><input required value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} placeholder="NFC-000001" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-3 font-mono text-xs font-bold outline-none focus:border-blue-500" /></div></label>
              <label className="block"><span className="text-[10px] font-extrabold text-slate-600">Número serial / chip NFC</span><div className="relative mt-1"><Nfc size={15} className="absolute left-3 top-3.5 text-slate-400" /><input value={form.serial_number} onChange={(event) => setForm((current) => ({ ...current, serial_number: event.target.value.toUpperCase() }))} placeholder="SN-NFC-00001" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-3 font-mono text-xs font-bold outline-none focus:border-blue-500" /></div></label>
              <label className="block"><span className="text-[10px] font-extrabold text-slate-600">Cliente vinculado</span><div className="relative mt-1"><UserRound size={15} className="absolute left-3 top-3.5 text-slate-400" /><select value={form.client_id} onChange={(event) => setForm((current) => ({ ...current, client_id: event.target.value }))} className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-3 text-xs font-bold outline-none focus:border-blue-500"><option value="">Nenhum cliente</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></div></label>
              <label className="block"><span className="text-[10px] font-extrabold text-slate-600">URL do Google Maps, avaliação ou Instagram</span><div className="relative mt-1"><MapPin size={15} className="absolute left-3 top-3.5 text-slate-400" /><input type="url" value={form.google_review_url} onChange={(event) => setForm((current) => ({ ...current, google_review_url: event.target.value }))} placeholder="https://maps.app.goo.gl/..." className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-3 text-xs font-semibold outline-none focus:border-blue-500" /></div><small className="mt-1 block text-[9px] text-slate-400">Esse será o destino usado pelo NFC e pelo QR Code.</small></label>
              <label className="block"><span className="text-[10px] font-extrabold text-slate-600">Status da placa</span><select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold outline-none focus:border-blue-500"><option value="in_stock">Em estoque</option><option value="reserved">Reservada</option><option value="sold">Vendida</option><option value="configuring">Configurando</option><option value="active">Ativa</option><option value="disabled">Desativada</option></select></label>
            </div>
            <button type="submit" className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-blue-200">{saved ? <><Check size={16} /> Configuração salva!</> : <><Save size={16} /> Salvar configuração</>}</button>
          </form>
        </div>
      )}

      {qrPlate && (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-950/55 p-3 backdrop-blur-sm" onClick={() => setQrPlate(null)}><div className="mx-auto w-full max-w-md rounded-[28px] bg-white p-5" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><div><h2 className="text-base font-extrabold">QR Code da placa</h2><p className="font-mono text-[10px] text-slate-400">{qrPlate.code}</p></div><button type="button" onClick={() => setQrPlate(null)} className="mobile-icon-button"><X size={18} /></button></div><div className="mx-auto my-5 grid h-52 w-52 place-items-center rounded-3xl bg-slate-50 ring-1 ring-slate-100"><QrCode size={150} strokeWidth={1.3} /></div><p className="truncate rounded-xl bg-slate-50 p-3 text-center text-[10px] text-slate-500">{publicPlateUrl(qrPlate)}</p><div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={() => copyLink(qrPlate)} className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 py-3 text-xs font-bold"><Copy size={15} />{copied ? 'Copiado!' : 'Copiar link'}</button><button type="button" onClick={() => { openConfiguration(qrPlate); setQrPlate(null) }} className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-xs font-bold text-white"><Link2 size={15} /> Configurar</button></div></div></div>
      )}
    </MobilePage>
  )
}

function normalizeSerial(value) {
  return `${value || ''}`.replace(/[^a-z0-9]/gi, '').toUpperCase()
}
