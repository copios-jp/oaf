import closeConsumer from './close_consumer'
import closeProducer from './close_producer'
import closeTransport from './close_transport'
import connectTransport from './connect_transport'
import consumerSetLayers from './consumer_set_layers'
import createTransport from './create_transport'
import joinAsNewPeer from './join_as_new_peer'
import leave from './leave'
import pauseConsumer from './pause_consumer'
import pauseProducer from './pause_producer'
import recvTrack from './recv_track'
import resumeConsumer from './resume_consumer'
import resumeProducer from './resume_producer'
import sendTrack from './send_track'
import sync from './sync'
import { SIGNALING } from '../../constants'

const endpoint = (route) => {
  const { endpoint } = route
  return { endpoint: `${SIGNALING}/${endpoint}` }
}
export default [
  { ...closeConsumer, ...endpoint(closeConsumer) },
  { ...closeProducer, ...endpoint(closeProducer) },
  { ...closeTransport, ...endpoint(closeTransport) },
  { ...connectTransport, ...endpoint(connectTransport) },
  { ...consumerSetLayers, ...endpoint(consumerSetLayers) },
  { ...createTransport, ...endpoint(createTransport) },
  { ...joinAsNewPeer, ...endpoint(joinAsNewPeer) },
  { ...leave, ...endpoint(leave) },
  { ...pauseConsumer, ...endpoint(pauseConsumer) },
  { ...pauseProducer, ...endpoint(pauseProducer) },
  { ...recvTrack, ...endpoint(recvTrack) },
  { ...resumeConsumer, ...endpoint(resumeConsumer) },
  { ...resumeProducer, ...endpoint(resumeProducer) },
  { ...sendTrack, ...endpoint(sendTrack) },
  { ...sync, ...endpoint(sync) },
]
