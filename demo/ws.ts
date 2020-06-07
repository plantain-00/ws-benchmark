import * as WebSocket from 'ws'

const wss = new WebSocket.Server({ port: 8070, clientTracking: true })

wss.on('connection', ws => {
  ws.on('message', data => {
    // do nothing
  })
})

process.on('SIGINT', () => {
  process.exit()
})

process.on('SIGTERM', () => {
  process.exit()
})
