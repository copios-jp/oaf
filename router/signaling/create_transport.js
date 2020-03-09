import { createWebRtcTransport } from '../../media_soup'
import { log, err } from '../../debug'
import { CREATE_TRANSPORT, POST } from '../../constants'
import roomState from '../../room_state'

export default {
  endpoint: CREATE_TRANSPORT,
  method: POST,
  async process(req, res) {
    const { peerId, direction } = req.body

    log('create-transport', peerId, direction)

    try {
      const transport = createWebRtcTransport({ peerId, direction })
      const { id, iceParameters, iceCandidates, dtlsParameters } = transport

      roomState.transports[id] = transport

      res.send({
        transportOptions: { id, iceParameters, iceCandidates, dtlsParameters },
      })
    } catch (e) {
      err(e)
      res.send({ error: e })
    }
  },
}
