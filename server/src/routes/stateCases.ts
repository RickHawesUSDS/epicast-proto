import express from 'express'
import asyncHandler from 'express-async-handler'
import { getLogger } from '@/utils/loggers'
import { publishFeed } from '@/controllers/publishFeed'

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
  publishFeed(req.bucket, req.stateCaseTimeSeries)
  res.send('success')
}))

/* GET schema */
router.get('/schema', asyncHandler(async (req, res, _next) => {
  logger.info('get the schema')
  res.send(req.stateCaseTimeSeries.schema)
}))

export default router
