import roomState from '../../room_state'
import debugModule from 'debug'
import { err } from '../../debug'
import { POST, SYNC } from '../../constants'

export default {
  endpoint: SYNC,
  method: POST,
  async process(req, res) {
    const { peerId } = req.body

    const { peers, activeSpeaker } = roomState

    try {
      if (!roomState.peers[peerId]) {
        throw new Error('not connected')
      }

      roomState.peers[peerId].lastSeenTs = Date.now()

      res.send({
        peers,
        activeSpeaker,
      })
    } catch (e) {
      err(e)
      res.send({ error: e })
    }
  },
}
