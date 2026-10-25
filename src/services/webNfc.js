export function isWebNfcAvailable() {
  return typeof window !== 'undefined'
    && window.isSecureContext
    && 'NDEFReader' in window
}

export function decodeNdefRecord(record) {
  if (typeof record.data === 'string') return record.data
  if (record.data instanceof DataView) return new TextDecoder(record.encoding || 'utf-8').decode(record.data)
  if (record.data instanceof ArrayBuffer || ArrayBuffer.isView(record.data)) {
    return new TextDecoder(record.encoding || 'utf-8').decode(record.data)
  }
  return ''
}

export function getNfcMessage(event) {
  const urls = []
  const texts = []
  for (const record of event.message.records) {
    const value = decodeNdefRecord(record).trim()
    if (!value) continue
    if (record.recordType === 'url' || record.recordType === 'absolute-url') urls.push(value)
    if (record.recordType === 'text') texts.push(value)
  }
  return { serialNumber: event.serialNumber || '', urls, texts }
}

export async function writeNfcUrl(url) {
  if (!isWebNfcAvailable()) {
    throw new Error('A gravação NFC funciona em um celular Android com Chrome, NFC ativado e acesso HTTPS.')
  }

  const destination = new URL(url)
  if (destination.protocol !== 'https:') throw new Error('O link gravado na placa precisa usar HTTPS.')

  const reader = new window.NDEFReader()
  await reader.write({ records: [{ recordType: 'url', data: destination.href }] })
}

export function nfcErrorMessage(error) {
  if (error?.name === 'NotAllowedError') return 'Permita o acesso NFC para este site nas configurações do navegador.'
  if (error?.name === 'NotSupportedError') return 'Esta etiqueta não é compatível com leitura/gravação NDEF.'
  if (error?.name === 'NotReadableError') return 'Não foi possível acessar a etiqueta. Confira se ela está desbloqueada e aproxime novamente.'
  if (error?.name === 'AbortError') return 'Leitura NFC interrompida.'
  return error?.message || 'Não foi possível se comunicar com a etiqueta NFC.'
}
