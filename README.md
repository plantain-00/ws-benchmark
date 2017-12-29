# ws-benchmark

[![Dependency Status](https://david-dm.org/plantain-00/ws-benchmark.svg)](https://david-dm.org/plantain-00/ws-benchmark)
[![devDependency Status](https://david-dm.org/plantain-00/ws-benchmark/dev-status.svg)](https://david-dm.org/plantain-00/ws-benchmark#info=devDependencies)
[![Build Status: Linux](https://travis-ci.org/plantain-00/ws-benchmark.svg?branch=master)](https://travis-ci.org/plantain-00/ws-benchmark)
[![Build Status: Windows](https://ci.appveyor.com/api/projects/status/github/plantain-00/ws-benchmark?branch=master&svg=true)](https://ci.appveyor.com/project/plantain-00/ws-benchmark/branch/master)
[![npm version](https://badge.fury.io/js/ws-benchmark.svg)](https://badge.fury.io/js/ws-benchmark)
[![Downloads](https://img.shields.io/npm/dm/ws-benchmark.svg)](https://www.npmjs.com/package/ws-benchmark)

A CLI tool for websocket, like apache bench for http.

## install

`npm i ws-benchmark -g`

## usage

run `ws-benchmark http://localhost:8080 -c 10 -n 2000`

## optional parameters

name | default | description
--- | --- | ---
-c | -c 1 | Number of multiple requests to make at a time(the count of http clients or websocket connections)
-n | -n 1 | Number of requests to perform
-m | -m GET | Method name
-s | -s 30 | Seconds to max. wait for each response
-f | | File containing data to request. Remember also to set -T
-T | -T 'text/plain' | Content-type header to use
-C | | Add cookie, eg. 'Apache=1234'
-H | | Add Arbitrary header line, eg. 'Accept-Encoding: gzip'
-k | | Use HTTP KeepAlive feature

## result example

```txt
Completed 200 requests
Completed 400 requests
Completed 600 requests
Completed 800 requests
Completed 1000 requests
Completed 1200 requests
Completed 1400 requests
Completed 1600 requests
Completed 1800 requests
Completed 2000 requests
Concurrency Level:      10
Time taken for tests:   0.196 seconds
Complete requests:      2000
Failed requests:        0
Requests per second:    10182.00 [#/sec] (mean)
Time per request:       0.982 [ms] (mean)
Time per request:       0.098 [ms] (mean, across all concurrent requests)
Average time:           0.069 [ms]
Min time:               0.032 [ms]
Max time:               1.612 [ms]

Percentage of the requests served within a certain time (ms)
  50%      0.060
  66%      0.068
  75%      0.077
  80%      0.081
  90%      0.093
  95%      0.102
  98%      0.110
  99%      0.129
 100%      1.612
```
