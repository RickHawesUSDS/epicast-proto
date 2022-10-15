import express from 'express'
import asyncHandler from 'express-async-handler'
import { getLogger } from '@/utils/loggers'
import { publishSchema } from '@/services/publishSchema'
import { publishTimeseries } from '@/services/publishTimeSeries'
import { S3Feed } from '@/utils/bucket'
import { FeedLog } from '@/services/FeedLog'

const router = express.Router()
const logger = getLogger('STATE_CASES_ROUTE')

/* GET get all cases. */
router.get('/', asyncHandler(async (req, res, _next) => {
  const sort = req.query.sort as string
  logger.info('Get all cases: sort=' + sort)

  const sortDescending = 'DESC'.localeCompare(sort, 'en', { sensitivity: 'base' }) === 0
  const cases = await req.stateCaseTimeSeries.findEvents({ sortDescending })
  res.send(cases)
}))

/* POST add a random new cases */
router.post('/random', asyncHandler(async (req, res, _next) => {
  let numPerDay = parseInt(req.query.numPerDay as string)
  let numOfDays = parseInt(req.query.numOfDays as string)
  if (isNaN(numPerDay)) numPerDay = 1
  if (isNaN(numOfDays)) numOfDays = 1
  logger.info(`Add random cases: ${numOfDays}, ${numPerDay}`)
  const stateCases = await req.stateCaseTimeSeries.insertFakeStateCases(numOfDays, numPerDay)
  res.send(stateCases)
}))

/* POST publish all cases */
router.post('/publish', asyncHandler(async (req, res, _next) => {
  logger.info('publish state cases')
  const log = new FeedLog()
  await publishSchema(req.feed, log)
  await publishTimeseries(req.stateCaseTimeSeries, req.feed, log)
  await log.publish(req.feed)
  res.send('success')
}))

export default router
