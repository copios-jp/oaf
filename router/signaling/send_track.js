import { log, err } from '../../debug'
import { closeProducer } from '../../media_soup'
import { SEND_TRACK, POST } from '../../constants'
import roomState from '../../room_state'

export default {
  endpoint: SEND_TRACK,

  method: POST,

  async process(req, res) {
    const { peerId, transportId, kind, rtpParameters, paused = false, appData } = req.body
    const transport = roomState.transports[transportId]

    log('send-track', peerId, transportId, kind, rtpParameters, paused)

    try {
      if (!transport) {
        throw new Error(`server-side transport ${transportId} not found`)
      }

      const producer = await transport.produce({
        kind,
        rtpParameters,
        paused,
        appData: { ...appData, peerId, transportId },
      })

      const { id } = producer
      // if our associated transport closes, close ourself, too
      producer.on('transportclose', () => {
        log("producer's transport closed", id)
        closeProducer(producer)
      })

      // monitor audio level of this producer. we call addProducer() here,
      // but we don't ever need to call removeProducer() because the core
      // AudioLevelObserver code automatically removes closed producers
      if (producer.kind === 'audio') {
        audioLevelObserver.addProducer({ producerId: id })
      }

      roomState.producers.push(producer)
      roomState.peers[peerId].media[appData.mediaTag] = {
        paused,
        encodings: rtpParameters.encodings,
      }

      res.send({ id })
    } catch (e) {
      err(e)
      send({ error: e })
    }
  },
}
