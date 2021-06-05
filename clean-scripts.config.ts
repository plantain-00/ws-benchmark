import { Service, checkGitStatus, sleep } from 'clean-scripts'

const tsFiles = `"src/**/*.ts"`

export default {
  build: [
    'rimraf dist/',
    'tsc -p src/'
  ],
  lint: {
    ts: `eslint --ext .js,.ts,.tsx ${tsFiles}`,
    export: `no-unused-export ${tsFiles}`,
    markdown: `markdownlint README.md`,
    typeCoverage: 'type-coverage -p src --strict'
  },
  test: [
    [
      new Service('ts-node demo/http.ts'),
      () => sleep(2000),
      `node dist/index.js "http://localhost:8080" -c 10 -n 2000`
    ],
    [
      new Service('ts-node demo/ws.ts'),
      () => sleep(3000),
      `node dist/index.js "ws://localhost:8070" -c 10 -n 2000`
    ],
    'clean-release --config clean-run.config.ts',
    () => checkGitStatus()
  ],
  fix: `eslint --ext .js,.ts,.tsx ${tsFiles} --fix`
}
