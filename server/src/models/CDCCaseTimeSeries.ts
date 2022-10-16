import { Op, Order, WhereOptions } from 'sequelize'

import { CDCCase } from '@/models/sequelizeModels/CDCCase'
import { FeedSchema } from './FeedSchema'
import { TimeSeries, TimeSeriesCountOptions, TimeSeriesEvent, TimeSeriesFindOptions, TimeSeriesMutator } from './TimeSeries'

export class CDCCaseTimeSeries implements TimeSeries, TimeSeriesMutator {

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

  schema: FeedSchema = {
    epicastVersion: 1.0,
    organizationId: 'epicast',
    systemId: 'demoserver',
    feedId: 'feed1',
    validFrom: new Date(2022, 10, 1),
    elements: []
  }

  updateSchema (newSchema: FeedSchema): void {
    this.schema = newSchema
  }

  updateEvents(events: TimeSeriesEvent[]): void {
    throw new Error('Method not implemented.')
  }
  
  initialize(newSchema: FeedSchema, newEvents: TimeSeriesEvent[]): void {
    throw new Error('Method not implemented.')
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
