import express, { Request } from 'express'
import asyncHandler from 'express-async-handler'
import { getLogger } from '@/utils/loggers'
import { MongoTimeSeries } from './MongoTimeSeries'
import { FeedSubscriber } from './FeedSubscriber'
import { publishFeed } from '@/epicast/publishFeed'
import { FeedStorage } from '@/epicast/FeedStorage'
import { deduplicateCases } from './deduplicateCases'
import { insertFakeCases } from './insertFakeCases'

const router = express.Router()
const logger = getLogger('AGENCIES_ROUTE')

function getAgencyTimeSeries (req: Request): MongoTimeSeries | undefined {
  const agencyName = req.params.agency
  const agency = req.state.agenciesFeature.agencies[agencyName]
  if (agency === undefined) return
  return agency.timeSeries
}

function getAgencySubscriber (req: Request): FeedSubscriber | undefined {
  const agencyName = req.params.agency
  const agency = req.state.agenciesFeature.agencies[agencyName]
  if (agency === undefined) return
  const subscriberName = req.params.subscriber
  return agency.subscribers.find(s => s.model.name === subscriberName)
}

function getAgencySubscribers (req: Request): FeedSubscriber[] | undefined {
  const agencyName = req.params.agency
  const agency = req.state.agenciesFeature.agencies[agencyName]
  if (agency === undefined) return
  return agency.subscribers
}

function getFeedStorage (req: Request): FeedStorage {
  return req.state.feedsFeature.storage
}

// DevNote: add topic to the paths when multiple topics are supported

/// TimeSeries routes

/* GET get all cases. */
router.get('/:agency', asyncHandler(async (req, res, _next) => {
  const sort = req.query.sort as string
  logger.info(`Get all cases for ${req.params.agency}: sort=${sort}`)

  const sortDescending = 'DESC'.localeCompare(sort, 'en', { sensitivity: 'base' }) === 0
  const timeSeries = getAgencyTimeSeries(req)
  if (timeSeries === undefined) {
    res.status(404).send()
    return
  }

  const cases = await timeSeries.fetchEvents({ sortDescending })
  res.send(cases)
}))

/* POST add a random new cases */
router.post('/:agency/random', asyncHandler(async (req, res, _next) => {
  let numPerDay = parseInt(req.query.numPerDay as string)
  let numOfDays = parseInt(req.query.numOfDays as string)
  if (isNaN(numPerDay)) numPerDay = 1
  if (isNaN(numOfDays)) numOfDays = 1
  logger.info(`Add random cases: ${numOfDays}, ${numPerDay}`)
  const timeSeries = getAgencyTimeSeries(req)
  if (timeSeries === undefined) {
    res.status(404).send()
    return
  }

  const stateCases = await insertFakeCases(timeSeries, numOfDays, numPerDay)
  res.status(200).send(stateCases)
}))

/* POST publish all cases */
router.post('/:agency/publish', asyncHandler(async (req, res, _next) => {
  const timeSeries = getAgencyTimeSeries(req)
  if (timeSeries === undefined) {
    res.status(404).send()
    return
  }

  logger.info('publish state cases')
  const storage = getFeedStorage(req)
  await publishFeed(storage, timeSeries, { excludePII: true })
  res.status(200).send('success')
}))

/* Deduplicate */
router.post('/:agency/deduplicate', asyncHandler(async (req, res, _next) => {
  const timeSeries = getAgencyTimeSeries(req)
  if (timeSeries === undefined) {
    res.status(404).send()
    return
  }

  await deduplicateCases(timeSeries)
  res.status(200).send('success')
}))

/* GET summary */
router.get('/:agency/summary', asyncHandler(async (req, res, _next) => {
  logger.info(`Get ${req.query.agency as string} dictionary`)
  const timeSeries = getAgencyTimeSeries(req)
  if (timeSeries === undefined) {
    res.status(404).send()
    return
  }

  res.send(timeSeries.summary)
}))

/// Dictionary routes

/* GET dictionary */
router.get('/:agency/dictionary', asyncHandler(async (req, res, _next) => {
  logger.info(`Get ${req.query.agency as string} dictionary`)
  const timeSeries = getAgencyTimeSeries(req)
  if (timeSeries === undefined) {
    res.status(404).send()
    return
  }

  res.send(timeSeries.dictionary)
}))

/* PUT feed element */
router.put('/:agency/dictionary/:elementName', (req, res, _next) => {
  const elementName = req.params.elementName
  const timeSeries = getAgencyTimeSeries(req)
  if (timeSeries === undefined) {
    res.status(404).send()
    return
  }

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
router.delete('/:agency/dictionary/:elementName', (req, res, _next) => {
  const elementName = req.params.elementName
  const timeSeries = getAgencyTimeSeries(req)
  if (timeSeries === undefined) {
    res.status(404).send()
    return
  }

  logger.info(`delete the dictionary element: ${elementName}`)
  timeSeries.deleteFeedElement(elementName)
  res.status(204).send()
})

/// Subscriber routes

/* GET all subscribers */
router.get('/:agency/subscribers', asyncHandler(async (req, res, _next) => {
  logger.info('Get subscriber')
  const feedSubscribers = getAgencySubscribers(req)
  if (feedSubscribers === undefined) {
    res.status(404).send()
    return
  }
  const models = feedSubscribers.map(f => f.model)
  res.status(200).send(models)
}))

/* GET one subscriber */
router.get('/:agency/subscribers/:subscriber', asyncHandler(async (req, res, _next) => {
  logger.info('Get subscriber')
  const feedSubscriber = getAgencySubscriber(req)
  if (feedSubscriber === undefined) {
    res.status(404).send()
    return
  }
  res.status(200).send(feedSubscriber.model)
}))

/* Read all subscribers once */
router.post('/:agency/subscribers/read', asyncHandler(async (req, res, _next) => {
  logger.info('Read all subscribers')
  const feedSubscribers = getAgencySubscribers(req)
  if (feedSubscribers === undefined) {
    res.status(404).send()
    return
  }
  const models = await Promise.all(
    feedSubscribers.map(
      async (f) => await f.readOnce()
    )
  )
  res.status(200).send(models)
}))

/* Read one subscriber once */
router.post('/:agency/subscribers/:subscriber/read', asyncHandler(async (req, res, _next) => {
  logger.info('Read a feed')
  const feedSubscriber = getAgencySubscriber(req)
  if (feedSubscriber === undefined) {
    res.status(404).send()
    return
  }

  const model = await feedSubscriber.readOnce()
  res.send(model)
}))

/* Update a subscriber  */
router.post('/:agency/subscribers', (req, res, _next) => {
  logger.info('Update subscriber')
  const feedSubscribers = getAgencySubscribers(req)
  if (feedSubscribers === undefined) {
    res.status(404).send()
    return
  }

  const subcriberModels = feedSubscribers.map(f =>
    f.updateFeedSubscriber(req.body)
  )
  res.send(subcriberModels)
})

/* Update one subscriber model */
router.post('/:agency/subscribers/:subscriber', (req, res, _next) => {
  logger.info('Update subscriber')
  const feedSubscriber = getAgencySubscriber(req)
  if (feedSubscriber === undefined) {
    res.status(404).send()
    return
  }

  const subcriberModel = feedSubscriber.updateFeedSubscriber(req.body)
  res.send(subcriberModel)
})

export default router
