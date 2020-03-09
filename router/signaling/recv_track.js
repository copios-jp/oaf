import { log, err } from '../../debug'
import { closeConsumer, router } from '../../media_soup'
import { RECV_TRACK, POST } from '../../constants'
import roomState from '../../room_state'

export default {
  endpoint: RECV_TRACK,

  method: POST,

  async process(req, res) {
    const { peerId, mediaPeerId, mediaTag, rtpCapabilities } = req.body
    const producer = roomState.producers.find(
      (p) => p.appData.mediaTag === mediaTag && p.appData.peerId === mediaPeerId,
    )

    log('recv-track', peerId, mediaPeerId, mediaTag, rtpCapabilities)

    try {
      if (!producer) {
        throw new Error(`server-side producer for ${mediaPeerId}:${mediaTag} not found`)
      }

      if (!router.canConsume({ producerId: producer.id, rtpCapabilities })) {
        throw new Error(`client cannot consume ${mediaPeerId}:${mediaTag}`)
      }

      let transport = Object.values(roomState.transports).find(
        (t) => t.appData.peerId === peerId && t.appData.clientDirection === 'recv',
      )

      if (!transport) {
        throw new Error(`server-side recv transport for ${peerId} not found`)
      }

      const consumer = await transport.consume({
        producerId: producer.id,
        rtpCapabilities,
        paused: true, // see note above about always starting paused
        appData: { peerId, mediaPeerId, mediaTag },
      })

      // need both 'transportclose' and 'producerclose' event handlers,
      // to make sure we close and clean up consumers in all
      // circumstances
      consumer.on('transportclose', () => {
        log(`consumer's transport closed`, consumer.id)
        closeConsumer(consumer)
      })
      consumer.on('producerclose', () => {
        log(`consumer's producer closed`, consumer.id)
        closeConsumer(consumer)
      })

      // stick this consumer in our list of consumers to keep track of,
      // and create a data structure to track the client-relevant state
      // of this consumer
      roomState.consumers.push(consumer)
      roomState.peers[peerId].consumerLayers[consumer.id] = {
        currentLayer: null,
        clientSelectedLayer: null,
      }

      // update above data structure when layer changes.
      consumer.on('layerschange', (layers) => {
        log(`consumer layerschange ${mediaPeerId}->${peerId}`, mediaTag, layers)
        if (roomState.peers[peerId] && roomState.peers[peerId].consumerLayers[consumer.id]) {
          roomState.peers[peerId].consumerLayers[consumer.id].currentLayer =
            layers && layers.spatialLayer
        }
      })

      res.send({
        producerId: producer.id,
        id: consumer.id,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        type: consumer.type,
        producerPaused: consumer.producerPaused,
      })
    } catch (e) {
      err(e)
      res.send({ error: e })
    }
  },
}
