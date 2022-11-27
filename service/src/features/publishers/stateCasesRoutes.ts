import express from 'express'
import asyncHandler from 'express-async-handler'
import { getLogger } from '@/utils/loggers'
import { publishFeed } from '@/epicast/publishFeed'
import { getStateCaseTimeSeries, getFeedStorage } from '@/server/app'

const router = express.Router()
const logger = getLogger('STATE_CASES_ROUTE')

/* GET get all cases. */
router.get('/', asyncHandler(async (req, res, _next) => {
  const sort = req.query.sort as string
  logger.info(`Get all cases: sort=${sort}`)

  const sortDescending = 'DESC'.localeCompare(sort, 'en', { sensitivity: 'base' }) === 0
  const timeSeries = getStateCaseTimeSeries(req)
  const cases = await timeSeries.fetchEvents({ sortDescending })
  res.status(200).send(cases)
}))

/* POST add a random new cases */
router.post('/random', asyncHandler(async (req, res, _next) => {
  let numPerDay = parseInt(req.query.numPerDay as string)
  let numOfDays = parseInt(req.query.numOfDays as string)
  if (isNaN(numPerDay)) numPerDay = 1
  if (isNaN(numOfDays)) numOfDays = 1
  logger.info(`Add random cases: ${numOfDays}, ${numPerDay}`)
  const timeSeries = getStateCaseTimeSeries(req)
  const stateCases = await timeSeries.insertFakeStateCases(numOfDays, numPerDay)
  res.status(200).send(stateCases)
}))

/* POST publish all cases */
router.post('/publish', asyncHandler(async (req, res, _next) => {
  logger.info('publish state cases')
  const timeSeries = getStateCaseTimeSeries(req)
  const storage = getFeedStorage(req)
  await publishFeed(storage, timeSeries)
  res.status(200).send('success')
}))

/* GET dictionary */
router.get('/dictionary', asyncHandler(async (req, res, _next) => {
  logger.info('get the dictionary')
  const timeSeries = getStateCaseTimeSeries(req)
  res.status(200).send(timeSeries.dictionary)
}))

/* PUT feed element */
router.put('/dictionary/:elementName', (req, res, _next) => {
  const elementName = req.params.elementName
  const timeSeries = getStateCaseTimeSeries(req)
  logger.info(`put dictionary element: ${elementName}`)
  logger.debug(`put element ${JSON.stringify(req.body)}`)
  const created = timeSeries.addFeedElement(req.body)
  if (created) {
    res.status(201).send(timeSeries.dictionary.elements.find(e => e.name === elementName))
  } else {
    res.status(200).send(timeSeries.dictionary.elements.find(e => e.name === elementName))
  }
})

/* DELETE feed element */
router.delete('/dictionary/:elementName', (req, res, _next) => {
  const elementName = req.params.elementName
  const timeSeries = getStateCaseTimeSeries(req)
  logger.info(`delete the dictionary element: ${elementName}`)
  timeSeries.deleteFeedElement(elementName)
  res.status(204).send()
})

/* Deduplicate */
router.post('/deduplicate', asyncHandler(async (req, res, _next) => {
  const timeSeries = getStateCaseTimeSeries(req)
  await timeSeries.deduplicate()
  res.status(200).send('success')
}))

export default router
