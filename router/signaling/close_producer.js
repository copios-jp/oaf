import { log, err } from '../../debug'
import { closeProducer } from '../../media_soup'
import { CLOSE_PRODUCER, POST } from '../../constants'
import roomState from '../../room_state'

export default {
  endpoint: CLOSE_PRODUCER,

  method: POST,

  async process(req, res) {
    const { peerId, producerId } = req.body
    const producer = roomState.producers.find((p) => p.id === producerId)

    log('close-producer', peerId, producerId)

    try {
      if (!producer) {
        throw new Error(`server-side producer ${producerId} not found`)
      }
      await closeProducer(producer)
      res.send({ closed: true })
    } catch (e) {
      err(e)
      res.send({ error: e.message })
    }
  },
}
