import { app, BrowserWindow, ipcMain } from 'electron'
import { createReadStream } from 'fs'
import { join } from 'path'
import { format as formatUrl } from 'url'
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

const windows: Electron.BrowserWindow[] = []

type Status = 'ON' | 'OFF'

let status: Status = 'ON'

let mockFormatFramework: boolean = true

const isEnabled = () => status === 'ON'

ipcMain.on('SET_STATUS', (_: any, newStatus: Status) => {
  status = newStatus
})

ipcMain.on(
  'SET_MOCK_FORMAT',
  (_: any, newStatus: boolean) => {
    mockFormatFramework = newStatus
  }
)

app.on('ready', () => {
  windows.push(
    new BrowserWindow({
      width: 290,
      height: 290,
      titleBarStyle: 'hidden-inset',
      vibrancy: 'ultra-dark'
    })
  )

  windows.forEach(window =>
    window.loadURL(
      formatUrl({
        pathname: join(
          app.getAppPath(),
          'renderer/index.html'
        ),
        protocol: 'file:',
        slashes: true
      })
    )
  )
})

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

      if (isEnabled() && isTagRequestUrl(url))
        console.log(':: TAG REQUEST URL') ||
          createReadStream(
            join(__dirname, '../../mocks/tag.js')
          ).pipe(res)
      else if (
        mockFormatFramework &&
        isFormatFrameworkRequestUrl(url)
      ) {
        console.log(':: FORMAT FRAMEWORK REQUEST')
        console.log(url.pathname)

        const fileName = /\.js\.map$/.test(url.pathname!)
          ? 'teads-format.js.map'
          : 'teads-format.js'

        console.log(fileName)
        http.get('http://localhost:1337/format.js', _res =>
          _res.pipe(res)
        )
      } else if (isEnabled() && isAdRequestUrl(url))
        console.log(':: AD REQUEST URL') ||
          createReadStream(
            join(__dirname, '../../mocks/ad.json')
          ).pipe(res)
      else if (isEnabled() && isDailyBugleRequest(url))
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
