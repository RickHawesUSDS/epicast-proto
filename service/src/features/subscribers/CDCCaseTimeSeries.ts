import { Op, Order, WhereOptions } from 'sequelize'

import { CDCCase } from '@/features/subscribers/CDCCase'
import { FeedSchema } from '@/epicast/FeedSchema'
import { TimeSeriesCountOptions, TimeSeriesEvent, TimeSeriesFindOptions, TimeSeriesMetadata, MutableTimeSeries, TimeSeriesDeletedEvent } from '@/epicast/TimeSeries'
import { assert } from 'console'
import { getLogger } from 'log4js'

const logger = getLogger('CDC_CASE_TIME_SERIES')

export class CDCCaseTimeSeries implements MutableTimeSeries<CDCCase> {
  async findEvents (options: TimeSeriesFindOptions): Promise<CDCCase[]> {
    const where: WhereOptions<CDCCase> = {}
    if (options.interval !== undefined) {
      where.caseDate = { [Op.between]: [options.interval.start, options.interval.end] }
    } else if (options.after !== undefined) {
      where.caseDate = { [Op.gt]: options.after }
    } else if (options.before !== undefined) {
      where.caseDate = { [Op.lt]: options.before }
    }
    if (options.updatedAfter !== undefined) {
      where.updatedAt = { [Op.gt]: options.updatedAfter }
    }
    const order: Order = [['caseDate', (options?.sortDescending ?? false) ? 'DESC' : 'ASC']]
    return await CDCCase.findAll({ where, order })
  }

  async countEvents (options: TimeSeriesCountOptions): Promise<number> {
    const whereClause: WhereOptions<CDCCase> = {}
    if (options.interval !== undefined) {
      whereClause.caseDate = { [Op.between]: [options.interval.start, options.interval.end] }
    } else if (options.after !== undefined) {
      whereClause.caseDate = { [Op.gt]: options.after }
    } else if (options.before !== undefined) {
      whereClause.caseDate = { [Op.lt]: options.before }
    }
    if (options.updatedAfter !== undefined) {
      whereClause.updatedAt = { [Op.gt]: options.updatedAfter }
    }
    return await CDCCase.count({ where: whereClause })
  }

  async fetchMetadata (): Promise<TimeSeriesMetadata | null> {
    const lastUpdated = await CDCCase.findOne({ order: [['updatedAt', 'DESC']] })
    if (lastUpdated === null) return null
    const lastCase = await CDCCase.findOne({ order: [['caseDate', 'DESC']] })
    if (lastCase === null) return null
    return { lastUpdatedAt: lastUpdated.updatedAt, lastEventAt: lastCase.caseDate }
  }

  makeTimeSeriesEvent (event: CDCCase): TimeSeriesEvent<CDCCase> {
    return new CDCCaseTimeSeriesEvent(event)
  }

  schema: FeedSchema = {
    epicastVersion: 1.0,
    subjectId: 'epicast',
    reporterId: 'demoserver',
    topicId: 'feed1',
    validFrom: new Date(1900, 1, 1), // Early date
    elements: []
  }

  updateSchema (newSchema: FeedSchema): void {
    this.schema = newSchema
  }

  async upsertEvents (events: CDCCase[]): Promise<void> {
    for (const event of events) {
      const current = await CDCCase.findByPk(event.caseId, {})
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
          caseId: event.eventId
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

export class CDCCaseTimeSeriesEvent implements TimeSeriesEvent<CDCCase> {
  #cdcCase: CDCCase

  constructor (cdcCase: CDCCase) {
    this.#cdcCase = cdcCase
  }

  get eventAt (): Date {
    return this.#cdcCase.caseDate
  }

  get eventId (): number {
    return this.#cdcCase.caseId
  }

  get eventUpdatedAt (): Date {
    return this.#cdcCase.updatedAt
  }

  get isDeleted (): boolean | undefined {
    return undefined
  }

  get replacedBy (): number | undefined {
    return undefined
  }

  get model (): CDCCase {
    return this.#cdcCase
  }

  getValue (name: string): any {
    return this.#cdcCase[name as keyof CDCCase]
  }
}
