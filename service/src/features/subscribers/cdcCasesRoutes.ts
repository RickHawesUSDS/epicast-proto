import express from 'express'
import asyncHandler from 'express-async-handler'
import { getLogger } from '@/utils/loggers'
import { readFeed } from '@/epicast/readFeed'
import { updateFeedSubscriber } from '@/features/subscribers/updateFeedSubscriber'
import { getFeedBucket, getCDCCaseTimeSeries, getCDCSubscriber } from '@/server/app'

const router = express.Router()
const logger = getLogger('CDC_CASES_ROUTE')

/* GET get all cases. */
router.get('/', asyncHandler(async (req, res, _next) => {
  const sort = req.query.sort as string
  logger.info(`Get all cases: sort=${sort}`)

  const sortDescending = 'DESC'.localeCompare(sort, 'en', { sensitivity: 'base' }) === 0
  const timeSeries = getCDCCaseTimeSeries(req)
  const cases = await timeSeries.findEvents({ sortDescending: sortDescending })
  res.send(cases)
}))

/* GET get all schema */
router.get('/schema', asyncHandler(async (req, res, _next) => {
  logger.info('Get CDC Schema')
  const timeSeries = getCDCCaseTimeSeries(req)
  res.send(timeSeries.schema)
}))

/* GET subscriber */
router.get('/subscriber', asyncHandler(async (req, res, _next) => {
  logger.info('Get subscriber')
  const feedSubscriber = getCDCSubscriber(req)
  res.send(feedSubscriber.model)
}))

router.post('/subscriber', (req, res, _next) => {
  logger.info('Update subscriber')
  const feedSubscriber = updateFeedSubscriber(req.feedSubscriber, req.body)
  res.send(feedSubscriber)
})

router.post('/subscriber/once', asyncHandler(async (req, res, _next) => {
  logger.info('Read feed')
  const bucket = getFeedBucket(req)
  const lastPublished = await readFeed(bucket, req.cdcCaseTimeSeries)
  const feedSubscriber = getCDCSubscriber(req)
  feedSubscriber.setLastChecked(lastPublished)
  res.send(feedSubscriber.model)
}))

export default router
