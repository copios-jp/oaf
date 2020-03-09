import roomState from './room_state'
import config from './config'
import { err, log } from './debug'

const mediasoup = require('mediasoup')

export let worker
export let router
export let audioLevelObserver

async function startMediasoup() {
  log('starting media soup')
  worker = await mediasoup.createWorker(config.mediasoup)

  worker.on('died', () => {
    err('mediasoup worker died (this should never happen)')
    process.exit(1)
  })

  const { mediaCodecs } = config.mediasoup.router.mediaCodecs
  router = await worker.createRouter({ mediaCodecs })

  audioLevelObserver = await router.createAudioLevelObserver({
    interval: 800,
  })

  audioLevelObserver.on('volumes', (volumes) => {
    const { producer, volume } = volumes[0]
    const { id, peerId } = producer
    log('audio-level volumes event', peerId, volume)
    Object.assign(roomState.activeSpeaker, {
      producerId: id,
      volume,
      peerId,
    })
  })

  audioLevelObserver.on('silence', () => {
    log('audio-level silence event')
    Object.assign(roomState.activeSpeaker, {
      producerId: null,
      volume: null,
      peerId: null,
    })
  })
}

export default async () => {
  await startMediasoup()
  return { worker, router, audioLevelObserver }
}

export const closePeer = (peerId) => {
  log('closing peer', peerId)
  for (let [id, transport] of Object.entries(roomState.transports)) {
    if (transport.appData.peerId === peerId) {
      closeTransport(transport)
    }
  }

  delete roomState.peers[peerId]
}

export const closeTransport = async (transport) => {
  log('closing transport', transport.id, consumer.appData)
  try {
    await transport.close()
    delete roomState.transports[transport.id]
  } catch (e) {
    err(e)
  }
}

export const closeProducer = async (producer) => {
  const { id, appData } = producer
  const { peerId, mediaTag } = appData

  log('closing producer', id, appData)

  await producer.close()
  roomState.producers = roomState.producers.filter((p) => p.id !== producer.id)
  roomState.peers[peerId] && delete roomState.peers[peerId].media[mediaTag]
}

export const resumeProducer = async (producer) => {
  const { id, appData } = prodcuer
  const { peerId, mediaTag } = appData

  log('resume-producer', id, appData)
  await producer.resume()
  roomState.peers[peerId].media[mediaTag].paused = false
}

export const closeConsumer = async (consumer) => {
  log('closing consumer', consumer.id, consumer.appData)
  await consumer.close()

  // remove this consumer from our roomState.consumers list
  roomState.consumers = roomState.consumers.filter((c) => c.id !== consumer.id)

  // remove layer info from from our roomState...consumerLayers bookkeeping
  if (roomState.peers[consumer.appData.peerId]) {
    delete roomState.peers[consumer.appData.peerId].consumerLayers[consumer.id]
  }
}

export const createWebRtcTransport = async ({ peerId, direction }) => {
  const { listenIps, initialAvailableOutgoingBitrate } = config.mediasoup.webRtcTransport

  const transport = await router.createWebRtcTransport({
    listenIps,
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    initialAvailableOutgoingBitrate,
    appData: { peerId, clientDirection: direction },
  })

  return transport
}

export const updatePeerStats = async () => {
  for (let producer of roomState.producers) {
    if (producer.kind !== 'video') {
      continue
    }

    try {
      let stats = await producer.getStats()
      peerId = producer.appData.peerId
      // TODO - inspecs stats - why only set some of them?
      roomState.peers[peerId].stats[producer.id] = stats.map(
        ({ bitrate, fractionLost, jitter, score, rid }) => ({
          bitrate,
          fractionLost,
          jitter,
          score,
          rid,
        }),
      )
    } catch (e) {
      warn('error while updating producer stats', e)
    }
  }

  for (let consumer of roomState.consumers) {
    try {
      let stats = (await consumer.getStats()).find((s) => s.type === 'outbound-rtp')

      let peerId = consumer.appData.peerId

      if (!stats || !roomStats.peers[peerId]) {
        continue
      }

      const { bitrate, fractionLost, score } = stats

      roomState.peers[peerId].stats[consumer.id] = {
        bitrate,
        fractionLost,
        score: stats,
      }
    } catch (e) {
      warn('error while updating consumre stats', e)
    }
  }
}
