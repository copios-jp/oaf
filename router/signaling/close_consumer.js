import { log, err } from '../../debug'
import { closeConsumer } from '../../media_soup'
import { CLOSE_CONSUMER, POST } from '../../constants'
import roomState from '../../room_state'

export default {
  endpoint: CLOSE_CONSUMER,

  method: POST,

  async process(req, res) {
    const { consumerId } = req.body
    const consumer = roomState.consumers.find((c) => c.id === consumerId)

    log('close-consumer', consumerId)

    try {
      if (!consumer) {
        throw new Error(`server-side consumer ${consumerId} not found`)
      }

      await closeConsumer()
      res.send({ resumed: true })
    } catch (e) {
      err(e)
      res.send({ error: e })
    }
  },
}
