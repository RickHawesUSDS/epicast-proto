import { Db, Collection } from 'mongodb'

import { MongoTimeSeriesEvent } from '@/features/publishers/MongoTimeSeriesEvent'
import { MutableTimeSeries, TimeSeriesCountOptions, TimeSeriesDeletedEvent, TimeSeriesEvent, TimeSeriesFindOptions, TimeSeriesMetadata } from '@/epicast/TimeSeries'
import { FeedDictionary, MutableFeedDictionary } from '@/epicast/FeedDictionary'
import { FeedSummary, updateFeedSummary } from '@/epicast/FeedSummary'
import { FeedElement } from '@/epicast/FeedElement'
import { getLogger } from '@/utils/loggers'
import assert from 'assert'

const logger = getLogger('MONGO_TIME_SERIES')

export class MongoTimeSeries implements MutableTimeSeries<MongoTimeSeriesEvent> {
  collection?: Collection<MongoTimeSeriesEvent>
  dictionary: MutableFeedDictionary
  summary: FeedSummary
  collectionName: string
  private readonly initialDictionary: FeedDictionary
  private readonly initialFeedSummary: FeedSummary

  constructor (
    collectionName: string,
    initialDictionary: FeedDictionary,
    initialSummary: FeedSummary
  ) {
    this.collectionName = collectionName
    this.initialDictionary = initialDictionary
    this.dictionary = new MutableFeedDictionary(initialDictionary)
    this.summary = initialSummary
    this.initialFeedSummary = initialSummary
  }

  async initialize (db: Db): Promise<void> {
    logger.info(`Initializing ${this.collectionName}...`)
    this.collection = db.collection(this.collectionName)
    await this.collection.createIndex({ eventUpdatedAt: 1 })
    await this.collection.createIndex({ eventAt: 1 })
  }

  async fetchEvents (options: TimeSeriesFindOptions): Promise<TimeSeriesEvent[]> {
    if (this.collection === undefined) return []
    logger.debug('Fetching events...')
    const whereClause: any = {
    }
    if (options.interval !== undefined) {
      whereClause.eventAt = { $gte: options.interval.start, $lt: options.interval.end }
    } else if (options.after !== undefined) {
      whereClause.eventAt = { $gte: options.after }
    } else if (options.before !== undefined) {
      whereClause.eventAt = { $lt: options.before }
    }
    if (options.updatedAfter !== undefined) {
      whereClause.eventUpdatedAt = { $gt: options.updatedAfter }
    }
    if (options.isDeleted !== undefined) {
      whereClause.eventIsDeleted = options.isDeleted
    } else {
      whereClause.eventIsDeleted = { $ne: true }
    }

    const order = options?.sortDescending ?? false ? -1 : 1
    const sortClause: any = {
      eventAt: order,
      eventId: order
    }

    return await this.collection
      .find(whereClause)
      .sort(sortClause)
      .toArray()
  }

  async countEvents (options: TimeSeriesCountOptions): Promise<number> {
    if (this.collection === undefined) return 0
    const whereClause: any = {
    }
    if (options.interval !== undefined) {
      whereClause.eventAt = { $gte: options.interval.start, $lt: options.interval.end }
    } else if (options.after !== undefined) {
      whereClause.eventAt = { $gte: options.after }
    } else if (options.before !== undefined) {
      whereClause.eventAt = { $lt: options.before }
    }
    if (options.updatedAfter !== undefined) {
      whereClause.eventUpdatedAt = { $gt: options.updatedAfter }
    }
    if (options.isDeleted !== undefined) {
      whereClause.eventIsDeleted = options.isDeleted
    } else {
      whereClause.eventIsDeleted = { $ne: true }
    }

    return await this.collection.countDocuments(whereClause)
  }

  async upsertEvents (events: MongoTimeSeriesEvent[]): Promise<void> {
    if (this.collection === undefined) return
    logger.debug(`Upsert events...: ${events.length}`)
    if (events.length === 0) return
    const updatedAt = new Date()
    for (const event of events) {
      event.eventUpdatedAt = updatedAt
      await this.collection.updateOne(
        { _id: event.eventId },
        { $set: event },
        { upsert: true }
      )
    }
    const metadata = await this.fetchMetadata()
    this.summary = updateFeedSummary(this.initialFeedSummary, metadata)
  }

  async deleteEvents (events: TimeSeriesDeletedEvent[]): Promise<void> {
    if (this.collection === undefined) return
    logger.debug(`Delete events...: ${events.length}`)
    if (events.length === 0) return
    const updatedAt = new Date()
    for (const event of events) {
      await this.collection.updateOne(
        { _id: event.eventId },
        { $set: { eventIdDeleted: true, eventReplacedBy: event.replaceBy, eventUpdatedAt: updatedAt } },
        { upsert: false }
      )
    }
    const metadata = await this.fetchMetadata()
    this.summary = updateFeedSummary(this.initialFeedSummary, metadata)
  }

  createEvent (names: string[], values: any[]): MongoTimeSeriesEvent {
    assert(names.length === values.length)
    const record = new MongoTimeSeriesEvent()
    for (let i = 0; i < names.length; i++) {
      record[names[i]] = values[i]
    }
    return record
  }

  async fetchMetadata (): Promise<TimeSeriesMetadata | null> {
    if (this.collection === undefined) return null
    const lastUpdatedEvent = await this.fetchLastUpdatedEvent()
    if (lastUpdatedEvent === null) return null
    const lastEvent = await this.fetchLastEvent()
    if (lastEvent === null) return null
    const firstEvent = await this.fetchFirstEvent()
    if (firstEvent === null) return null
    const count = await this.countAll()
    return {
      count,
      updatedAt: lastUpdatedEvent.eventUpdatedAt,
      firstEventAt: firstEvent.eventAt,
      lastEventAt: lastEvent.eventAt
    }
  }

  async fetchLastUpdatedEvent (): Promise<MongoTimeSeriesEvent | null> {
    if (this.collection === undefined) return null
    return await this.collection
      .findOne({ eventIsDeleted: { $ne: true } }, { sort: { eventUpdatedAt: -1 } })
  }

  async fetchLastEvent (): Promise<MongoTimeSeriesEvent | null> {
    if (this.collection === undefined) return null
    return await this.collection
      .findOne({ eventIsDeleted: { $ne: true } }, { sort: { eventAt: -1 } })
  }

  async fetchFirstEvent (): Promise<MongoTimeSeriesEvent | null> {
    if (this.collection === undefined) return null
    return await this.collection
      .findOne({ eventIsDeleted: { $ne: true } }, { sort: { eventAt: 1 } })
  }

  async countAll (): Promise<number> {
    if (this.collection === undefined) return 0
    return await this.collection
      .countDocuments({ eventIsDeleted: { $ne: true } })
  }

  async fetchAllEvents (): Promise<MongoTimeSeriesEvent[]> {
    if (this.collection === undefined) return []
    return await this.collection
      .find({ eventIsDeleted: { $ne: true } }, { sort: { eventAt: 1 } })
      .toArray()
  }

  async dropAllEvents (): Promise<void> {
    if (this.collection === undefined) return
    await this.collection.drop()
  }

  /// Dictionary Methods

  addFeedElement (element: FeedElement): boolean {
    return this.dictionary.addElement(element)
  }

  deleteFeedElement (name: string): boolean {
    return this.dictionary.deleteElement(name)
  }

  updateDictionary (dictionary: FeedDictionary): void {
    this.dictionary = new MutableFeedDictionary(dictionary)
  }

  resetDictionary (): void {
    this.dictionary = new MutableFeedDictionary(this.initialDictionary)
  }
}
