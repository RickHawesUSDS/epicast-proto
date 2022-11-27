import { Op, Order, WhereOptions } from 'sequelize'

import { CDCCase } from '@/features/subscribers/CDCCase'
import { FeedDictionary } from '@/epicast/FeedDictionary'
import { TimeSeriesCountOptions, TimeSeriesFindOptions, TimeSeriesMetadata, MutableTimeSeries, TimeSeriesDeletedEvent } from '@/epicast/TimeSeries'
import { assert } from 'console'
import { getLogger } from 'log4js'
import { FeedSummary } from '@/epicast/FeedSummary'

const logger = getLogger('CDC_CASE_TIME_SERIES')

export class CDCCaseTimeSeries implements MutableTimeSeries<CDCCase> {
  async fetchEvents (options: TimeSeriesFindOptions): Promise<CDCCase[]> {
    const where: WhereOptions<CDCCase> = {}
    if (options.interval !== undefined) {
      where.eventAt = { [Op.between]: [options.interval.start, options.interval.end] }
    } else if (options.after !== undefined) {
      where.eventAt = { [Op.gt]: options.after }
    } else if (options.before !== undefined) {
      where.eventAt = { [Op.lt]: options.before }
    }
    if (options.updatedAfter !== undefined) {
      where.eventUpdatedAt = { [Op.gt]: options.updatedAfter }
    }
    const order: Order = [['eventAt', (options?.sortDescending ?? false) ? 'DESC' : 'ASC']]
    return await CDCCase.findAll({ where, order })
  }

  async countEvents (options: TimeSeriesCountOptions): Promise<number> {
    const whereClause: WhereOptions<CDCCase> = {}
    if (options.interval !== undefined) {
      whereClause.eventAt = { [Op.between]: [options.interval.start, options.interval.end] }
    } else if (options.after !== undefined) {
      whereClause.eventAt = { [Op.gt]: options.after }
    } else if (options.before !== undefined) {
      whereClause.eventAt = { [Op.lt]: options.before }
    }
    if (options.updatedAfter !== undefined) {
      whereClause.eventUpdatedAt = { [Op.gt]: options.updatedAfter }
    }
    return await CDCCase.count({ where: whereClause })
  }

  async fetchMetadata (): Promise<TimeSeriesMetadata | null> {
    const lastUpdated = await CDCCase.findOne({ order: [['eventUpdatedAt', 'DESC']] })
    if (lastUpdated === null) return null
    const lastCase = await CDCCase.findOne({ order: [['eventAt', 'DESC']] })
    if (lastCase === null) return null
    return { lastUpdatedAt: lastUpdated.eventUpdatedAt, lastEventAt: lastCase.eventAt }
  }

  dictionary: FeedDictionary = {
    topic: 'feed1',
    reporter: 'demoserver',
    validFrom: new Date(1900, 1, 1), // Early date
    namespaces: [],
    elements: []
  }

  summary: FeedSummary = {
    epicastVersion: '0.1',
    subject: 'epicast',
    reporter: 'demoserver',
    topic: 'feed1',
    sourceUrl: 'xyz',
    sourceFeeds: [],
    lastUpdated: new Date()
  }

  updateDictionary (newDictionary: FeedDictionary): void {
    this.dictionary = newDictionary
  }

  async upsertEvents (events: CDCCase[]): Promise<void> {
    for (const event of events) {
      const current = await CDCCase.findByPk(event.eventId, {})
      if (current === null) {
        logger.debug('about to insert')
        await event.save({})
      } else {
        logger.debug('about to update')
        current.set(event)
        await current.save({})
      }
    }
  }

  async deleteEvents (events: TimeSeriesDeletedEvent[]): Promise<void> {
    if (events.length === 0) return
    for (const event of events) {
      await CDCCase.destroy({
        where: {
          eventId: event.eventId
        },
        force: true
      })
    }
  }

  createEvent (names: string[], values: any[]): CDCCase {
    assert(names.length === values.length)
    const record: any = {}
    for (let i = 0; i < names.length; i++) {
      record[names[i]] = values[i]
    }
    return CDCCase.build(record)
  }
}
