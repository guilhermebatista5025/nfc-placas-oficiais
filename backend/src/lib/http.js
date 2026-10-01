export class HttpError extends Error {
  constructor(status, message, code = 'request_error') {
    super(message)
    this.status = status
    this.code = code
  }
}

export function sendJson(response, status, body, origin) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Access-Control-Allow-Origin': origin,
    Vary: 'Origin',
  })
  response.end(JSON.stringify(body))
}

export async function readBody(request, maxBytes = 1_000_000) {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > maxBytes) throw new HttpError(413, 'Corpo da requisição muito grande.', 'payload_too_large')
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

export async function readJson(request) {
  const raw = await readBody(request)
  if (!raw.length) return {}
  try {
    return JSON.parse(raw.toString('utf8'))
  } catch {
    throw new HttpError(400, 'JSON inválido.', 'invalid_json')
  }
}
