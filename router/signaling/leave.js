import { closePeer } from '../../media_soup'
import { LEAVE, POST } from '../../constants'
import { log, err } from '../../debug'

export default {
  endpoint: LEAVE,

  method: POST,

  async process(ctx) {
    // Manual JSON parsing as this come in via navigator.beacon and does not have a content type header for koa-body to figure out.
    const { peerId } = ctx.request.body
    try {
      await closePeer(peerId)
      ctx.body = { left: true }
    } catch (e) {
      err(e)
      ctx.body = { error: e }
    }
  },
}
