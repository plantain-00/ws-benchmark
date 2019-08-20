const { Service, checkGitStatus } = require('clean-scripts')

const tsFiles = `"src/**/*.ts" "spec/**/*.ts"`
const jsFiles = `"*.config.js" "demo/*.js"`

module.exports = {
  build: [
    'rimraf dist/',
    'tsc -p src/'
  ],
  lint: {
    ts: `eslint --ext .js,.ts,.tsx ${tsFiles} ${jsFiles}`,
    export: `no-unused-export ${tsFiles}`,
    commit: `commitlint --from=HEAD~1`,
    markdown: `markdownlint README.md`,
    typeCoverage: 'type-coverage -p src --strict'
  },
  test: [
    'tsc -p spec',
    'jasmine',
    [
      new Service('node demo/http.js'),
      `node dist/index.js "http://localhost:8080" -c 10 -n 2000`
    ],
    [
      new Service('node demo/ws.js'),
      `node dist/index.js "ws://localhost:8070" -c 10 -n 2000`
    ],
    'clean-release --config clean-run.config.js',
    () => checkGitStatus()
  ],
  fix: `eslint --ext .js,.ts,.tsx ${tsFiles} ${jsFiles} --fix`
}
