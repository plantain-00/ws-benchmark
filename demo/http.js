const http = require('http')

http.createServer((request, response) => {
  response.end(`hello world`)
}).listen(8080)

process.on('SIGINT', () => {
  process.exit()
})

process.on('SIGTERM', () => {
  process.exit()
})
