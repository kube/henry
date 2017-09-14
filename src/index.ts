import { readFileSync } from 'fs'
import { join } from 'path'
import * as http from 'http'
import * as https from 'https'
import * as httpProxy from 'http-proxy'

import { Url, parse as parseUrl } from 'url'
import { parse as parseQueryString } from 'querystring'

// const enableHttpsProxy = true
const HTTP_PORT = 4242
const HTTPS_PORT = 7345

const proxy = httpProxy.createProxyServer({})

const isTeadsRequestUrl = ({ host }: Url) => /teads\.tv$/.test(host!)

const isAdRequestUrl = (url: Url) =>
  isTeadsRequestUrl(url) && /^\/page\/[0-9]+\/ad/.test(url.path!)

const getTarget = ({ protocol, host, port }: Url) => {
  const target = protocol + '//' + host + (port ? ':' + port : '')
  return target
}

http
  .createServer((req, res) => {
    if (req.url) {
      console.log('HTTP REQUEST')
      const url = parseUrl(req.url)

      if (isAdRequestUrl(url))
        console.log(JSON.parse(parseQueryString(url.query).page))

      proxy.web(
        req,
        res,
        {
          target: getTarget(url)
        },
        err => {
          if (err) {
            console.error(err)
          }
          res.end('Sorry.')
        }
      )
    } else {
      res.end('No url')
    }
  })
  .listen(HTTP_PORT, (err: any) => {
    if (err) console.error('Could not create HTTP proxy server')
    else console.log(`HTTP Proxy Server listening on ${HTTP_PORT}`)
  })

httpProxy
  .createServer({
    target: '127.0.0.1:4242',
    ssl: {
      key: readFileSync(join(__dirname, '../certificates/key.pem')),
      cert: readFileSync(join(__dirname, '../certificates/cert.pem')),
      passphrase: 'bonjourtoutlemonde'
    },
    secure: false
  })
  .listen(4243)

https
  .createServer(
    {
      key: readFileSync(join(__dirname, '../certificates/key.pem')),
      cert: readFileSync(join(__dirname, '../certificates/cert.pem')),
      passphrase: 'bonjourtoutlemonde'
    },
    (req, res) => {
      console.log('HTTPS')
      console.log(req.url)

      proxy.web(
        req,
        res,
        {
          target: req.url
        },
        err => {
          if (err) {
            console.error(err)
          }
          res.end('Sorry.')
        }
      )
    }
  )
  .listen(HTTPS_PORT, (err: any) => {
    if (err) console.error('Could not create HTTPS proxy server')
    else console.log(`HTTPS Proxy Server listening on ${HTTPS_PORT}`)
  })
