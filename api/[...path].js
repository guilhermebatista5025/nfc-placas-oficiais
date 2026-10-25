import handleRequest from '../backend/src/server.js'

export const config = { api: { bodyParser: false } }

export default function handler(request, response) {
  const routePath = request.params?.path ?? request.query?.path
  const segments = Array.isArray(routePath)
    ? routePath
    : typeof routePath === 'string'
      ? routePath.split('/').filter(Boolean)
      : []

  if (segments.length) {
    const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`)
    const path = `/api/${segments.map((segment) => encodeURIComponent(segment)).join('/')}`
    request.url = `${path}${requestUrl.search}`
  }

  return handleRequest(request, response)
}
