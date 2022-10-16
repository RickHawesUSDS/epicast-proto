import express from 'express'
import asyncHandler from 'express-async-handler'
import { getLogger } from '@/utils/loggers'

const router = express.Router()
const logger = getLogger('CDC_CASES_ROUTE')

/* GET get all cases. */
router.get('/', asyncHandler(async (req, res, _next) => {
  const sort = req.query.sort as string
  logger.info('Get all cases: sort=' + sort)

  const sortDescending = 'DESC'.localeCompare(sort, 'en', { sensitivity: 'base' }) === 0
  const cases = await req.cdcCaseTimeSeries.findEvents({ sortDescending })
  res.send(cases)
}))

/* GET subscriber */
router.get('/subscriber', asyncHandler(async (req, res, _next) => {
  logger.info('Get subscriber')

  res.send(req.feedSubscriber.model)
}))

router.post('/subscriber', asyncHandler(async (req, res, _next) => {
  logger.info('Post subscriber')
  req.feedSubscriber.update(req.body)

  res.send(req.feedSubscriber.model)
}))
