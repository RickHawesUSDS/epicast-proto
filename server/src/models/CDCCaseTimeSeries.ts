import { Op, Order, WhereOptions } from 'sequelize'

import { CDCCase } from '@/models/sequelizeModels/CDCCase'
import { FeedSchema } from './FeedSchema'
import { TimeSeries, TimeSeriesCountOptions, TimeSeriesEvent, TimeSeriesFindOptions, TimeSeriesMetadata, TimeSeriesMutator } from './TimeSeries'
import { assert } from 'console'

export class CDCCaseTimeSeries implements TimeSeries, TimeSeriesMutator<CDCCase> {
  async findEvents (options: TimeSeriesFindOptions): Promise<TimeSeriesEvent[]> {
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
    const cdcCases = await CDCCase.findAll({ where, order })
    return cdcCases.map((c) => new CDCCaseTimeSeriesEvent(c))
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
    const lastCase = await CDCCase.findOne({ order: [['caseAt', 'DESC']] })
    if (lastCase === null) return null
    return { lastUpdatedAt: lastUpdated.updatedAt,  lastEventAt: lastCase.caseDate }
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
      await CDCCase.upsert(event)
    }
  }

  createEvent(names: string[], values: any[]): CDCCase {
    assert(names.length === values.length)
    const cdcCase = new CDCCase()
    for(let i = 0; i < names.length; i++) {
      cdcCase.set(names[i] as keyof CDCCase, values[i])
    }
    return cdcCase
  }
}

export class CDCCaseTimeSeriesEvent implements TimeSeriesEvent {
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

  getValue (name: string): any {
    return this.#cdcCase[name as keyof CDCCase]
  }
}
