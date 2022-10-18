import { Op, Order, WhereOptions } from 'sequelize'
import { db } from '@/utils/db'

import { CDCCase } from '@/models/sequelizeModels/CDCCase'
import { FeedSchema } from './FeedSchema'
import { TimeSeries, TimeSeriesCountOptions, TimeSeriesEvent, TimeSeriesFindOptions, TimeSeriesMetadata, MutableTimeSeries  } from './TimeSeries'
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
    return await CDCCase.count({ where })
  }

  async fetchMetadata(): Promise<TimeSeriesMetadata | null> {
    const lastUpdated = await CDCCase.findOne({ order: [['updatedAt', 'DESC']] })
    if (lastUpdated === null) return null
    const lastCase = await CDCCase.findOne({ order: [['caseDate', 'DESC']] })
    if (lastCase === null) return null
    return { lastUpdatedAt: lastUpdated.updatedAt,  lastEventAt: lastCase.caseDate }
  }

  makeTimeSeriesEvent(event: CDCCase): TimeSeriesEvent<CDCCase> {
      return new CDCCaseTimeSeriesEvent(event)
  }

  schema: FeedSchema = {
    epicastVersion: 1.0,
    organizationId: 'epicast',
    systemId: 'demoserver',
    feedId: 'feed1',
    validFrom: new Date(1900, 1, 1), // Early date
    elements: []
  }

  updateSchema (newSchema: FeedSchema): void {
    this.schema = newSchema
  }

  async upsertEvents(events: CDCCase[]): Promise<void> {
    for (const event of events) {
      // TODO: for some reason cannot get upsert to insert the optional fields of the object
      await db.transaction(async transaction => {
        const current = await CDCCase.findByPk(event.caseId, {transaction: transaction})
        if (current === null) {
          logger.debug('about to insert')
          await event.save({transaction: transaction})
        } else {
          logger.debug('about to update')
          current.set(event)
          await current.save({transaction: transaction})
        }
      })
    }
  }

  createEvent(names: string[], values: any[]): CDCCase {
    assert(names.length === values.length)
    let record: any = {}
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

  get model(): CDCCase {
    return this.#cdcCase
  }

  getValue (name: string): any {
    return this.#cdcCase[name as keyof CDCCase]
  }
}
