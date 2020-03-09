import { log, err } from '../../debug'
import { CONSUMER_SET_LAYERS, POST } from '../../constants'
import roomState from '../../room_state'

export default {
  endpoint: CONSUMER_SET_LAYERS,

  method: POST,

  async process(req, res) {
    const { peerId, consumerId, spatialLayer } = req.body
    const consumer = roomState.consumers.find((c) => c.id === consumerId)

    log('consumer-set-layers', peerId, consumerId, spatialLayer)

    try {
      if (!consumer) {
        throw new Error(`server-side consumer ${consumerId} not found`)
      }

      await consumer.setPreferredLayers({ spatialLayer })
      res.send({ layersSet: true })
    } catch (e) {
      err(e)
      res.send({ error: e })
    }
  },
}
