const WebSocket = require('uws')

const wss = new WebSocket.Server({ port: 8070, clientTracking: true })

wss.on('connection', ws => {
  ws.on('message', data => {
  })
})
