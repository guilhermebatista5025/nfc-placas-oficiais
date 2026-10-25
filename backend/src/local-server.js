import { createServer } from 'node:http'
import { env } from './config/env.js'
import { handleRequest } from './server.js'

const server = createServer(handleRequest)
server.listen(env.port, '127.0.0.1', () => {
  console.log(`Craft NFC backend disponível em http://127.0.0.1:${env.port}`)
})

function shutdown() {
  server.close(() => process.exit(0))
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
