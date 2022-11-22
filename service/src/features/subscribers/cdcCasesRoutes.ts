import express from 'express'
import asyncHandler from 'express-async-handler'
import { getLogger } from '@/utils/loggers'
import { readFeed } from '@/epicast/readFeed'
import { updateFeedSubscriber } from '@/features/subscribers/updateFeedSubscriber'
import { getFeedBucket } from '@/server/app'

const router = express.Router()
const logger = getLogger('CDC_CASES_ROUTE')

/* GET get all cases. */
router.get('/', asyncHandler(async (req, res, _next) => {
  const sort = req.query.sort as string
  logger.info(`Get all cases: sort=${sort}`)

  const sortDescending = 'DESC'.localeCompare(sort, 'en', { sensitivity: 'base' }) === 0
  const cases = await req.cdcCaseTimeSeries.findEvents({ sortDescending })
  res.send(cases)
}))

/* GET get all schema */
router.get('/schema', asyncHandler(async (req, res, _next) => {
  logger.info('Get CDC Schema')
  res.send(req.cdcCaseTimeSeries.schema)
}))

/* GET subscriber */
router.get('/subscriber', asyncHandler(async (req, res, _next) => {
  logger.info('Get subscriber')
  res.send(req.feedSubscriber.model)
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
  req.feedSubscriber.setLastChecked(lastPublished)
  res.send(req.feedSubscriber.model)
}))

export default router
