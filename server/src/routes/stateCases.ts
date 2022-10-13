import express from 'express'
import asyncHandler from 'express-async-handler'
import { getLogger } from '@/utils/loggers'
import { insertFakeStateCases, findAllStateCases } from '@/services/stateCases'
import { publishStateCaseFeed } from '@/services/publishStateCasesFeed'
import { S3Feed } from '@/utils/bucket'

const router = express.Router()
const logger = getLogger('STATE_CASES_ROUTE')

/* GET get all cases. */
router.get('/', asyncHandler(async (req, res, _next) => {
  const sort = req.query.sort as string
  logger.info('Get all cases: sort=' + sort)

  const sortDecending = 'DESC'.localeCompare(sort, 'en', { sensitivity: 'base' }) === 0
  const cases = await findAllStateCases(sortDecending)
  res.send(cases)
}))

/* POST add a random new cases */
router.post('/random', asyncHandler(async (req, res, _next) => {
  let numPerDay = parseInt(req.query.numPerDay as string)
  let numOfDays = parseInt(req.query.numOfDays as string)
  if (isNaN(numPerDay)) numPerDay = 1
  if (isNaN(numOfDays)) numOfDays = 1
  logger.info(`Add random cases: ${numOfDays}, ${numPerDay}`)
  const stateCases = await insertFakeStateCases(numOfDays, numPerDay)
  res.send(stateCases)
}))

/* POST publish all cases */
router.post('/publish', asyncHandler(async (req, res, _next) => {
  logger.info('publish cases')
  const feed = new S3Feed()
  await publishStateCaseFeed(feed)
  res.send('success')
}))

export default router
