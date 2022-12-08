import { Db, Collection } from 'mongodb'

import { EventElementName, MutableTimeSeries, TimeSeriesCountOptions, TimeSeriesDeletedEvent, TimeSeriesEvent, TimeSeriesFindOptions, TimeSeriesMetadata } from '@/epicast/TimeSeries'
import { FeedDictionary } from '@/epicast/FeedDictionary'
import { MutableFeedDictionary } from "@/epicast/MutableFeedDictionary"
import { FeedSummary, updateFeedSummary } from '@/epicast/FeedSummary'
import { FeedElement } from '@/epicast/FeedElement'
import { getLogger } from '@/utils/loggers'
import { mergeDictionaries } from '@/epicast/mergeDictionaries'

const logger = getLogger('MONGO_TIME_SERIES')

export class MongoTimeSeriesEvent implements TimeSeriesEvent {
  eventId!: string
  eventAt!: Date
  eventSubject!: string
  eventReporter!: string
  eventTopic!: string
  eventIsDeleted?: boolean
  eventReplacedBy?: string
  eventUpdatedAt!: Date
  [name: string]: any

  constructor(from: any) {
    Object.assign(this, from)
  }

  getValue(name: EventElementName): any {
    return this[name]
  }

  get _id(): string {
    return this.eventId
  }

  set _id(id: string) {
    this.eventId = id
  }
}

export class MongoTimeSeries implements MutableTimeSeries<MongoTimeSeriesEvent> {
  collection?: Collection<MongoTimeSeriesEvent>
  dictionary: MutableFeedDictionary
  summary: FeedSummary
  private readonly collectionName: string
  private readonly initialDictionary: FeedDictionary
  private subscriberDictionaries: FeedDictionary[] = []
  private readonly initialSummary: FeedSummary
  private readonly subscriberSummaries: FeedSummary[] = []

  private lastEventNumber: number = 1

  /// Setup Methods

  constructor(
    initialSummary: FeedSummary,
    initialDictionary: FeedDictionary
  ) {
    this.collectionName = `${initialSummary.subject}.${initialSummary.reporter}`
    this.initialDictionary = { ...initialDictionary, reporter: initialSummary.reporter }
    this.dictionary = new MutableFeedDictionary(this.initialDictionary)
    this.summary = initialSummary
    this.initialSummary = initialSummary
  }

  async initialize(db: Db): Promise<void> {
    logger.info(`Initializing ${this.collectionName} for ${this.summary.reporter} ...`)
    this.collection = db.collection(this.collectionName)
    await this.collection.deleteMany({})
    await this.collection.createIndex({ eventUpdatedAt: 1 })
    await this.collection.createIndex({ eventAt: 1 })
  }

  async reset(): Promise<void> {
    await this.dropAllEvents()
    this.resetDictionary()
  }

  /// TimeSeries Methods

  async fetchEvents(options: TimeSeriesFindOptions): Promise<TimeSeriesEvent[]> {
    if (this.collection === undefined) return []
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

    const rawEvents = await this.collection
      .find(whereClause)
      .sort(sortClause)
      .toArray()

    logger.debug(`Fetching ${rawEvents.length} events`)
    return rawEvents.map(e => new MongoTimeSeriesEvent(e))
  }

  async countEvents(options: TimeSeriesCountOptions): Promise<number> {
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

  async fetchMetadata(): Promise<TimeSeriesMetadata | null> {
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

  /// Mutable TimeSeries methods

  async upsertEvents(events: MongoTimeSeriesEvent[]): Promise<void> {
    if (this.collection === undefined) return
    logger.debug(`Upserting ${events.length} events...`)
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
    this.summary = updateFeedSummary(this.initialSummary, metadata)
  }

  async deleteEvents(events: TimeSeriesDeletedEvent[]): Promise<void> {
    if (this.collection === undefined) return
    logger.debug(`Deleting ${events.length} events...`)
    if (events.length === 0) return
    const updatedAt = new Date()
    for (const event of events) {
      await this.collection.updateOne(
        { _id: event.eventId },
        { $set: { eventIsDeleted: true, eventReplacedBy: event.replaceBy, eventUpdatedAt: updatedAt } },
        { upsert: false }
      )
    }
    const metadata = await this.fetchMetadata()
    this.summary = updateFeedSummary(this.initialSummary, metadata)
  }

  createEvent(eventValues: any): MongoTimeSeriesEvent {
    const updatedValues = {
      ...eventValues,
      eventId: eventValues.eventId !== undefined ? eventValues.eventId : this.generateNextId(),
      eventUpdatedAt: new Date()
    }
    return new MongoTimeSeriesEvent(updatedValues)
  }

  /// Additional methods

  private generateNextId(): string {
    return `${this.dictionary.reporter}.${this.lastEventNumber++}`
  }

  async fetchLastUpdatedEvent(): Promise<MongoTimeSeriesEvent | null> {
    if (this.collection === undefined) return null
    return await this.collection
      .findOne({ eventIsDeleted: { $ne: true } }, { sort: { eventUpdatedAt: -1 } })
  }

  async fetchLastEvent(): Promise<MongoTimeSeriesEvent | null> {
    if (this.collection === undefined) return null
    return await this.collection
      .findOne({ eventIsDeleted: { $ne: true } }, { sort: { eventAt: -1 } })
  }

  async fetchFirstEvent(): Promise<MongoTimeSeriesEvent | null> {
    if (this.collection === undefined) return null
    return await this.collection
      .findOne({ eventIsDeleted: { $ne: true } }, { sort: { eventAt: 1 } })
  }

  async countAll(): Promise<number> {
    if (this.collection === undefined) return 0
    return await this.collection
      .countDocuments({ eventIsDeleted: { $ne: true } })
  }

  async fetchAllEvents(): Promise<MongoTimeSeriesEvent[]> {
    if (this.collection === undefined) return []
    return await this.collection
      .find({ eventIsDeleted: { $ne: true } }, { sort: { eventAt: 1 } })
      .toArray()
  }

  async dropAllEvents(): Promise<void> {
    if (this.collection === undefined) return
    await this.collection.deleteMany({})
    this.summary = updateFeedSummary(this.initialSummary, null)
  }

  /// Dictionary Methods

  addFeedElement(element: FeedElement): boolean {
    return this.dictionary.addElement(element)
  }

  deleteFeedElement(name: string): boolean {
    return this.dictionary.deleteElement(name)
  }

  updateSubscriberDictionary(subscriberDictionary: FeedDictionary): void {
    const index = this.subscriberDictionaries.findIndex(d => d.reporter === subscriberDictionary.reporter)
    if (index !== -1) {
      this.subscriberDictionaries[index] = subscriberDictionary
    } else {
      this.subscriberDictionaries.push(subscriberDictionary)
    }
    const mergedDictionary = mergeDictionaries(this.summary.reporter, [this.dictionary, subscriberDictionary])
    this.dictionary = new MutableFeedDictionary(mergedDictionary)
  }

  resetDictionary(): void {
    this.dictionary = new MutableFeedDictionary(this.initialDictionary)
    this.subscriberDictionaries = []
  }
}
