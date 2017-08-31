const childProcess = require('child_process')

module.exports = {
  build: [
    'rimraf dist/',
    'tsc -p src/'
  ],
  lint: {
    ts: `tslint "src/**/*.ts"`,
    js: `standard "**/*.config.js"`,
    export: `no-unused-export "src/**/*.ts" "spec/*.ts"`
  },
  test: [
    'tsc -p spec',
    'jasmine',
    async () => {
      const httpServer = childProcess.spawn('node', ['demo/http.js'])
      const httpClientResult = childProcess.execSync(`node dist/index.js "http://localhost:8080" -c 10 -n 2000`)
      console.log(httpClientResult.toString())
      httpServer.kill('SIGINT')
    },
    async () => {
      const wsServer = childProcess.spawn('node', ['demo/ws.js'])
      const wsClientResult = childProcess.execSync(`node dist/index.js "ws://localhost:8070" -c 10 -n 2000`)
      console.log(wsClientResult.toString())
      wsServer.kill('SIGINT')
    },
    () => new Promise((resolve, reject) => {
      childProcess.exec('git status -s', (error, stdout, stderr) => {
        if (error) {
          reject(error)
        } else {
          if (stdout) {
            reject(new Error('generated files does not match.'))
          } else {
            resolve()
          }
        }
      }).stdout.pipe(process.stdout)
    })
  ],
  fix: {
    ts: `tslint --fix "src/**/*.ts"`,
    js: `standard --fix "**/*.config.js"`
  },
  release: `clean-release`
}
