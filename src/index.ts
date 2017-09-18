import { createReadStream } from 'fs'
import { join } from 'path'
import * as http from 'http'
import * as httpProxy from 'http-proxy'
import * as serveStatic from 'serve-static'
import * as finalHandler from 'finalhandler'

import { Url, parse as parseUrl } from 'url'

const HTTP_PORT = 4242
const proxy = httpProxy.createProxyServer({})

const isTeadsRequestUrl = (url: Url) =>
  /teads\.tv$/.test(url.hostname!)

// const isFormatFrameworkRequestUrl = (url: Url) =>
//   isTeadsRequestUrl(url) &&
//     /^/.test(url.path!)

const isDailyBugleRequest = (url: Url) =>
  /dailybugle\.com$/.test(url.hostname!)

const isTagRequestUrl = (url: Url) =>
  isTeadsRequestUrl(url) &&
  /^\/page\/[0-9]+\/tag/.test(url.path!)

const isAdRequestUrl = (url: Url) =>
  isTeadsRequestUrl(url) &&
  /^\/page\/[0-9]+\/ad/.test(url.path!)

const getTarget = ({ protocol, host }: Url) =>
  protocol + '//' + host

const serve = serveStatic('websites/dailybugle', {
  index: ['index.html']
})

http
  .createServer((req, res) => {
    if (req.url) {
      const url = parseUrl(req.url)

      res.setHeader(
        'Access-Control-Allow-Credentials',
        'true'
      )
      res.setHeader(
        'Access-Control-Allow-Origin',
        getTarget(parseUrl('' + req.headers.referer))
      )

      if (isTagRequestUrl(url))
        console.log(':: TAG REQUEST URL') ||
          createReadStream(
            join(__dirname, '../mocks/tag.js')
          ).pipe(res)
      else if (isAdRequestUrl(url))
        console.log(':: AD REQUEST URL') ||
          createReadStream(
            join(__dirname, '../mocks/ad.json')
          ).pipe(res)
      else if (isDailyBugleRequest(url))
        console.log(':: DAILY BUGLE') ||
          serve(
            req as any,
            res as any,
            finalHandler(req, res)
          )
      else
        console.log('>> ' + getTarget(url)) ||
          console.log('       ' + url.path) ||
          proxy.web(
            req,
            res,
            {
              target: getTarget(url)
            },
            err => {
              console.error(err)
              res.end('Sorry.')
            }
          )
    } else {
      res.end('No url')
    }
  })
  .listen(HTTP_PORT, (err: any) => {
    if (err)
      console.error('Could not create HTTP proxy server')
    else
      console.log(
        `HTTP Proxy Server listening on ${HTTP_PORT}`
      )
  })
