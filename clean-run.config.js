module.exports = {
  include: [
    'bin/*',
    'dist/*.js',
    'package.json',
    'yarn.lock'
  ],
  exclude: [
  ],
  postScript: [
    'cd "[dir]" && yarn --production',
    '[dir]/bin/ws-benchmark "http://localhost:8080" -c 10 -n 2000',
    '[dir]/bin/ws-benchmark "ws://localhost:8070" -c 10 -n 2000'
  ]
}
