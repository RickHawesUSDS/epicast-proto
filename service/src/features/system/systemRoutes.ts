import express from 'express'
import { getLogger } from '@/utils/loggers'
import { resetSystem } from '@/features/system/resetSystem'
import asyncHandler from 'express-async-handler'
const router = express.Router()
const logger = getLogger('SYSTEM_ROUTE')

/* Reset the system. */
router.post('/reset', asyncHandler(async (req, res, _next) => {
  logger.info('system reset')
  await resetSystem(req.stateCaseTimeSeries, req.bucket)
  res.send('Successful reset')
}))

export default router
