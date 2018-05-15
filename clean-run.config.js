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
    'node [dir]/dist/index.js "http://localhost:8080" -c 10 -n 2000',
    'node [dir]/dist/index.js "ws://localhost:8070" -c 10 -n 2000'
  ]
}
