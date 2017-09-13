// import { readFileSync } from 'fs'
// import { join } from 'path'
import * as http from 'http'
// import * as https from 'https'
import * as httpProxy from 'http-proxy'

// const enableHttpsProxy = true
const HTTP_PORT = 4242
// const HTTPS_PORT = 7345

const proxy = httpProxy.createProxyServer({
  target: 'http://www.kube.io'
})

http
  .createServer((_req, res) => {
    console.log('HTTP Request')
    proxy.web(_req, res, {}, err => {
      if (err) {
        console.error(err)
      }
      res.end('Sorry.')
    })
  })
  .listen(HTTP_PORT, (err: any) => {
    if (err) console.error('Could not create HTTP proxy server')
    else console.log(`HTTP Proxy Server listening on ${HTTP_PORT}`)
  })

// if (enableHttpsProxy) {
//   https
//     .createServer(
//       {
//         key: readFileSync(join(__dirname, '../certificates/key.pem')),
//         cert: readFileSync(
//           join(__dirname, '../certificates/cert.pem')
//         ),
//         passphrase: 'bonjourtoutlemonde'
//       },
//       (_req, res) => {
//         console.log('HTTPS Request')
//         res.end('Hello!')
//       }
//     )
//     .listen(HTTPS_PORT, (err: any) => {
//       if (err) console.error('Could not create HTTPS proxy server')
//       else
//         console.log(`HTTPS Proxy Server listening on ${HTTPS_PORT}`)
//     })
// }
