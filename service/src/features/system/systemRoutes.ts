import express from 'express'
import { getLogger } from '@/utils/loggers'
import asyncHandler from 'express-async-handler'
const router = express.Router()
const logger = getLogger('SYSTEM_ROUTE')

/* Reset the system. */
router.post('/reset', asyncHandler(async (req, res, _next) => {
  logger.info('system reset')
  await req.state.systemFeature.reset()
  res.send('Successful reset')
}))

export default router
