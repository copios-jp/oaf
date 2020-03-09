import { log, err } from '../../debug'
import { PAUSE_PRODUCER, POST } from '../../constants'
import roomState from '../../room_state'

export default {
  endpoint: PAUSE_PRODUCER,

  method: POST,

  async process(req, res) {
    const { peerId, producerId } = req.body
    const producer = roomState.producers.find((p) => p.id === producerId)

    log('pause-producer', peerID, producerId)

    try {
      if (!producer) {
        throw new Error(`server-side producer ${producerId} not found`)
      }

      await producer.pause()
      roomState.peers[peerId].media[producer.appData.mediaTag].paused = true
      res.send({ paused: true })
    } catch (e) {
      err(e)
      res.send({ error: e })
    }
  },
}
