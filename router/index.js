import Router from 'koa-router'
import koaBody from 'koa-body'
import signaling from './signaling'

const router = new Router()

// koaRouter.post('/signaling/close-consumer', async (req, res) => {})
// koaRouter.post('/signaling/close-producer', async (req, res) => {})
// koaRouter.post('/signaling/close-transport', async (req, res) => {})
// koaRouter.post('/signaling/connect-transport', async (req, res) => {})
// koaRouter.post('/signaling/consumer-set-layers', async (req, res) => {})
// koaRouter.post('/signaling/create-transport', async (req, res) => {})
// koaRouter.post('/signaling/join-as-new-peer', async (req, res) => {})
// koaRouter.post('/signaling/leave', async (req, res) => {})
// koaRouter.post('/signaling/pause-consumer', async (req, res) => {})
// koaRouter.post('/signaling/pause-producer', async (req, res) => {})
// koaRouter.post('/signaling/recv-track', async (req, res) => {})
// koaRouter.post('/signaling/resume-consumer', async (req, res) => {})
// koaRouter.post('/signaling/resume-producer', async (req, res) => {})
// koaRouter.post('/signaling/send-track', async (req, res) => {})
// koaRouter.post('/signaling/sync', async (req, res) => {})

signaling.forEach((route) => {
  const { method, endpoint, process } = route
  router[method](endpoint, koaBody(), process)
})
router.get('', (ctx) => {
  ctx.body = 'CHUNKY!!'
})
export default router
