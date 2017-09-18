import { createReadStream } from 'fs'
import { join } from 'path'
import * as http from 'http'
import * as httpProxy from 'http-proxy'
import * as serveStatic from 'serve-static'
import * as finalHandler from 'finalhandler'

import { parse as parseUrl } from 'url'

import {
  getTarget,
  isAdRequestUrl,
  isDailyBugleRequest,
  isFormatFrameworkRequestUrl,
  isTagRequestUrl
} from './lib'

const HTTP_PORT = 4242
const proxy = httpProxy.createProxyServer({})

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
      else if (isFormatFrameworkRequestUrl(url)) {
        console.log(':: FORMAT FRAMEWORK REQUEST')
        console.log(url.pathname)

        const fileName = /\.js\.map$/.test(url.pathname!)
          ? 'teads-format.js.map'
          : 'teads-format.js'

        console.log(fileName)

        createReadStream(
          `/Users/cfeijoo/Code/service-web-formats/dist/format/${fileName}`
        ).pipe(res)
      } else if (isAdRequestUrl(url))
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
