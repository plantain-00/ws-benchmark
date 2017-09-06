const childProcess = require('child_process')
const util = require('util')

const execAsync = util.promisify(childProcess.exec)

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
    async () => {
      const { stdout } = await execAsync('git status -s')
      if (stdout) {
        console.log(stdout)
        throw new Error(`generated files doesn't match.`)
      }
    }
  ],
  fix: {
    ts: `tslint --fix "src/**/*.ts"`,
    js: `standard --fix "**/*.config.js"`
  },
  release: `clean-release`
}
