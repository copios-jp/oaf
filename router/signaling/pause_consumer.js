import { log, err } from '../../debug'
import { PAUSE_CONSUMER, POST } from '../../constants'
import roomState from '../../room_state'

export default {
  endpoint: PAUSE_CONSUMER,

  method: POST,

  async process(req, res) {
    const { peerId, consumerId } = req.body
    const consumer = roomState.consumers.find((c) => c.id === consumerId)

    log('pause-consumer', peerID, consumerId)

    try {
      if (!consumer) {
        throw new Error(`server-side consumer ${consumerId} not found`)
      }
      await consumer.pause()
      res.send({ paused: true })
    } catch (e) {
      err(e)
      res.send({ error: e })
    }
  },
}
