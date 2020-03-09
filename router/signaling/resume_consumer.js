import { log, err } from '../../debug'
import { RESUME_CONSUMER, POST } from '../../constants'
import roomState from '../../room_state'

export default {
  endpoint: RESUME_CONSUMER,

  method: POST,

  async process(req, res) {
    const { peerId, consumerId } = req.body
    const consumer = roomState.consumers.find((c) => c.id === consumerId)

    log('resume-consumer', peerId, consumerId)

    try {
      if (!consumer) {
        throw new Error(`server-side consumer ${consumerId} not found`)
      }
      await consumer.resume()
      res.send({ resumed: true })
    } catch (e) {
      err(e)
      res.send({ error: e })
    }
  },
}
