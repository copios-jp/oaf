import { log, err } from '../../debug'
import { closeTransport } from '../../media_soup'
import { CLOSE_TRANSPORT, POST } from '../../constants'
import roomState from '../../room_state'

export default {
  endpoint: CLOSE_TRANSPORT,
  method: POST,
  async process(req, res) {
    const { peerId, transportId } = req.body
    const transport = roomState.transports[transportId]

    log('close-transport', peerId, transport.appData)

    try {
      if (!transport) {
        throw new Error(`server-side transport ${transportId} not found`)
      }
      await closeTransport(transport)
      res.send({ closed: true })
    } catch (e) {
      err(e)
      res.send({ error: e.message })
    }
  },
}
