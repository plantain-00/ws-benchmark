import * as minimist from 'minimist'
import * as http from 'http'
import * as https from 'https'
import * as fs from 'fs'
import { URL } from 'url'
import * as microtime from 'microtime'
import * as WebSocket from 'ws'
import * as packageJson from '../package.json'

let suppressError = false

function showToolVersion () {
  console.log(`Version: ${packageJson.version}`)
}

async function executeCommandLine () {
  const argv = minimist(process.argv.slice(2), { '--': true })

  const showVersion = argv.v || argv.version
  if (showVersion) {
    showToolVersion()
    return
  }

  suppressError = argv.suppressError

  const concurrency = argv.c || 1
  const requests = argv.n || 1
  const urls = argv._
  if (!urls) {
    throw new Error('Expect url')
  }
  if (urls.length !== 1) {
    throw new Error('Expect only one url')
  }
  const url = urls[0]
  const method = argv.m || 'GET'
  const timeout = (argv.s || 30) * 1000
  const filepath = argv.f
  const file = filepath ? fs.readFileSync(filepath).toString() : ''
  const contentType = argv.T || 'text/plain'
  const headerObject: { [key: string]: string } = {}
  const cookies: string | string[] = argv.C
  if (cookies) {
    contentType.Cookie = Array.isArray(cookies) ? cookies.join(';') : cookies
  }
  const headers: string | string[] = argv.H
  if (Array.isArray(headers)) {
    for (const header of headers) {
      const tmp = header.split(':')
      if (tmp.length >= 2) {
        headerObject[tmp[0].trim()] = tmp[1].trim()
      }
    }
  } else if (typeof headers === 'string') {
    const tmp = headers.split(':')
    if (tmp.length >= 2) {
      headerObject[tmp[0].trim()] = tmp[1].trim()
    }
  }
  const keepAlive = argv.k
  if (keepAlive) {
    headerObject.Connection = 'keep-alive'
  }

  const minRequestCountPerClient = Math.floor(requests / concurrency)
  const extraRequestCount = requests % concurrency
  const progressStep = Math.floor(requests / 10.0)
  let responseCount = 0
  let errorCount = 0
  const totalRequestTimes: number[] = []
  const startMoment = microtime.now()

  function showProgress () {
    if (responseCount % progressStep === 0) {
      // tslint:disable-next-line:no-console
      console.log(`Completed ${responseCount} requests`)
    }
  }

  function showResult () {
    const time = microtime.now() - startMoment
    // tslint:disable:no-console
    console.log(`Concurrency Level:      ${concurrency}`)
    console.log(`Time taken for tests:   ${(time / 1000000.0).toFixed(3)} seconds`)
    console.log(`Complete requests:      ${requests - errorCount}`)
    console.log(`Failed requests:        ${errorCount}`)
    console.log(`Requests per second:    ${(requests * 1000000.0 / time).toFixed(2)} [#/sec] (mean)`)
    console.log(`Time per request:       ${(time * concurrency / requests / 1000.0).toFixed(3)} [ms] (mean)`)
    console.log(`Time per request:       ${(time / requests / 1000.0).toFixed(3)} [ms] (mean, across all concurrent requests)`)
    console.log(`Average time:           ${(totalRequestTimes.reduce((p, c) => p + c, 0) / requests / 1000.0).toFixed(3)} [ms]`)
    totalRequestTimes.sort((a, b) => a - b)
    console.log(`Min time:               ${(totalRequestTimes[0] / 1000.0).toFixed(3)} [ms]`)
    console.log(`Max time:               ${(totalRequestTimes[totalRequestTimes.length - 1] / 1000.0).toFixed(3)} [ms]`)

    console.log(``)
    console.log(`Percentage of the requests served within a certain time (ms)`)

    for (const percent of [50, 66, 75, 80, 90, 95, 98, 99, 100]) {
      let index = Math.floor(totalRequestTimes.length * percent / 100.0)
      if (index === totalRequestTimes.length) {
        index = totalRequestTimes.length - 1
      }
      console.log(` ${percent === 100 ? '100' : ` ${percent}`}%      ${(totalRequestTimes[index] / 1000.0).toFixed(3)}`)
    }
    // tslint:enable:no-console
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    const urlObject = new URL(url)
    const request = urlObject.protocol === 'https:' ? https.request : http.request

    for (let i = 0; i < concurrency; i++) {
      const agent = urlObject.protocol === 'https:' ? new https.Agent() : new http.Agent()
      const requestCount = i < extraRequestCount ? minRequestCountPerClient + 1 : minRequestCountPerClient;

      (async () => {
        for (let j = 0; j < requestCount; j++) {
          await new Promise<void>((resolve, reject) => {
            const requestStartMoment = microtime.now()

            const req = request({
              protocol: urlObject.protocol,
              host: urlObject.host,
              hostname: urlObject.hostname,
              port: +urlObject.port,
              method,
              path: urlObject.pathname,
              agent,
              timeout,
              headers: {
                'Content-Type': contentType,
                'Content-Length': file.length,
                ...headerObject
              }
            }, res => {
              responseCount++
              totalRequestTimes.push(microtime.now() - requestStartMoment)
              resolve()
            })
            req.on('error', err => {
              if (err) {
                // do nothing
              }
              responseCount++
              errorCount++
              totalRequestTimes.push(microtime.now() - requestStartMoment)
              resolve()
            })
            if (file) {
              req.write(file)
            }
            req.end()
          })
          showProgress()
          if (responseCount === requests) {
            showResult()
          }
        }
      })()
    }
  } else if (url.startsWith('ws://') || url.startsWith('wss://')) {
    for (let i = 0; i < concurrency; i++) {
      const requestCount = i < extraRequestCount ? minRequestCountPerClient + 1 : minRequestCountPerClient
      const ws = new WebSocket(url, {
        headers: headerObject
      })
      ws.onopen = () => {
        (async () => {
          for (let j = 0; j < requestCount; j++) {
            await new Promise<void>((resolve, reject) => {
              const requestStartMoment = microtime.now()

              ws.send(file || 'Hello world!', error => {
                if (error) {
                  errorCount++
                }
                responseCount++
                totalRequestTimes.push(microtime.now() - requestStartMoment)
                resolve()
              })
            })
            showProgress()
            if (responseCount === requests) {
              showResult()
            }
          }
          ws.close()
        })()
      }
    }
  } else {
    throw new Error('Invalid url')
  }
}

executeCommandLine().then(() => {
  console.log('ws-benchmark success.')
}, error => {
  if (error instanceof Error) {
    console.log(error.message)
  } else {
    console.log(error)
  }
  if (!suppressError) {
    process.exit(1)
  }
})
