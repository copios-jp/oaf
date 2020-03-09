import { log, err } from '../../debug'
import { CONNECT_TRANSPORT, POST } from '../../constants'
import roomState from '../../room_state'

export default {
  endpoint: CONNECT_TRANSPORT,
  method: POST,
  async process(req, res) {
    const { peerId, transportId, dtlsParameters } = req.body
    const transport = roomState.transports[transportId]

    log('connect-transport', peerId, transportId)

    try {
      if (!transport) {
        throw new Error(`server-side transport ${transportId} not found`)
      }
      await transport.connect({ dtlsParameters })
      res.send({ connected: true })
    } catch (e) {
      err(e)
      res.send({ error: e })
    }
  },
}
