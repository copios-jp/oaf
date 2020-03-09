import roomState from '../../room_state'
import debugModule from 'debug'
import { log, err } from '../../debug'
import { POST, JOIN_AS_NEW_PEER } from '../../constants'
import { router } from '../../media_soup'

export default {
  endpoint: JOIN_AS_NEW_PEER,
  method: POST,
  process(ctx) {
    const { peerId } = ctx.request.body
    const now = Date.now()

    try {
      roomState.peers[peerId] = {
        joinTS: now,
        lastSeenTs: now,
        media: {},
        consumerLayers: {},
        stats: {},
      }
      log('join new peer', peerId)

      ctx.body = { routerRtpCapabilities: router.rtpCapabilities }
    } catch (e) {
      log(e)
      ctx.body = { error: e }
    }
  },
}
