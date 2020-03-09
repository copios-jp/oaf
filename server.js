// https://github.com/daily-co/mediasoup-sandbox/blob/master/single-page/server.js
//
import Koa from 'koa'
import cors from '@koa/cors'
import logger from 'koa-logger'
import koaBody from 'koa-body'
import debugModule from 'debug'
import https from 'https'
import fs from 'fs'
import config from './config'
import roomState from './room_state'
import { err, warn, log } from './debug'
import mediaSoup, {
  worker,
  router,
  audioLevelObserver,
  updatePeerStats,
  closePeer,
} from './media_soup'
import koaRouter from './router'
const koaApp = new Koa()
let httpsServer

koaApp.on('error', (e) => {
  err(e.message)
})

async function main() {
  mediaSoup()

  koaApp.use(async (ctx, next) => {
    try {
      await next()
    } catch (e) {
      ctx.status = err.status || 500
      ctx.body = err.message
      ctx.app.emit('error', err, ctx)
    }
  })
  koaApp.use(koaBody())
  koaApp.use(cors({ credentials: true }))
  koaApp.use(logger())
  try {
    const tls = {
      cert: fs.readFile(config.sslCrt),
      key: fs.readFile(config.sslKey),
    }
    httpsServer = https.createServer(tls, koaApp)
    httpsServer.on('error', (e) => {
      err(e)
    })

    await new Promise((resolve) => {
      httpsServer.listen(config.httpPort, config.httpIp, () => {
        log(`server is running in HTTPS mode and listening on ${config.httpIp}:${config.httpPort}`)
        resolve()
      })
    })
  } catch {
    koaApp.use(koaRouter.routes())
    koaApp.use(koaRouter.allowedMethods())
    koaApp.listen(config.httpPort)

    log(`server is running in HTTP mode and listening on ${config.httpIp}:${config.httpPort}`)
  }
  setInterval(() => {
    let now = Date.now()
    Object.entries(roomState.peers).forEach(([id, p]) => {
      if (now - p.lastSeenTs > config.httpPeerStale) {
        warn(`removing stale peer ${id}`)
        closePeer(id)
      }
    })
  }, 1000)

  setInterval(updatePeerStats, 3000)
}
main()
