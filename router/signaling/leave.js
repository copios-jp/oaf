import { closePeer } from '../../media_soup'
import { LEAVE, POST } from '../../constants'
import { log, err } from '../../debug'

export default {
  endpoint: LEAVE,

  method: POST,

  async process(req, res) {
    const { peerId } = req
    log('leave', peerId)
    try {
      await closePeer(peerId)
      res.send({
        left: true,
      })
    } catch (e) {
      err(e)
      res.send({ error: e })
    }
  },
}
