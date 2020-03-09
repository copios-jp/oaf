import { log, err } from '../../debug'
import { resumeProducer } from '../../media_soup'
import { RESUME_PRODUCER, POST } from '../../constants'
import roomState from '../../room_state'

export default {
  endpoint: RESUME_PRODUCER,

  method: POST,

  async process(req, res) {
    const { producerId } = req.body
    const producer = roomState.producers.find((p) => p.id === producerId)

    try {
      if (!producer) {
        throw new Error(`server-side producer ${producerId} not found`)
      }
      await resumeProducer(producer)
      res.send({ resumed: true })
    } catch (e) {
      err(e)
      res.send({ error: e })
    }
  },
}
