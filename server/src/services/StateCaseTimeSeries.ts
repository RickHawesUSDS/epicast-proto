import { faker } from '@faker-js/faker'
import { addDays, endOfDay, startOfDay } from 'date-fns'
import { Op, Order, WhereOptions } from 'sequelize'

import { StateCase } from '@/models/StateCase'
import { TimeSeries, TimeSeriesCountOptions, TimeSeriesFindOptions } from './TimeSeries'
import { FeedElement } from './FeedElement'

export class StateCaseTimeSeries implements TimeSeries<StateCase> {
  async findEvents (options: TimeSeriesFindOptions): Promise<StateCase[]> {
    const where: WhereOptions<StateCase> = {}
    if (options.interval !== undefined) {
      where.onsetOfSymptoms = { [Op.between]: [options.interval.start, options.interval.end] }
    } else if (options.after !== undefined) {
      where.onsetOfSymptoms = { [Op.gt]: options.after }
    } else if (options.before !== undefined) {
      where.onsetOfSymptoms = { [Op.lt]: options.before }
    }
    if (options.updatedAfter !== undefined) {
      where.updatedAt = { [Op.gt]: options.updatedAfter }
    }
    const order: Order = [['onsetOfSymptoms', (options?.sortDescending ?? false) ? 'DESC' : 'ASC']]
    return await StateCase.findAll({ where, order })
  }

  async countEvents (options: TimeSeriesCountOptions): Promise<number> {
    const where: WhereOptions<StateCase> = {}
    if (options.interval !== undefined) {
      where.onsetOfSymptoms = { [Op.between]: [options.interval.start, options.interval.end] }
    } else if (options.after !== undefined) {
      where.onsetOfSymptoms = { [Op.gt]: options.after }
    } else if (options.before !== undefined) {
      where.onsetOfSymptoms = { [Op.lt]: options.before }
    }
    if (options.updatedAfter !== undefined) {
      where.updatedAt = { [Op.gt]: options.updatedAfter }
    }
    return await StateCase.count({ where })
  }

  getEventAt (event: StateCase): Date {
    return event.onsetOfSymptoms
  }

  getEventId (event: StateCase): string {
    return event.caseId.toString()
  }

  getEventUpdatedAt (event: StateCase): Date {
    return event.updatedAt
  }

  feedElements: FeedElement[] = []

  async insertFakeStateCases (numberOfDays: number, numberPerDay: number): Promise<StateCase[]> {
    const decideOnDate = async (): Promise<Date> => {
      const now = new Date()
      const stateCase = await StateCase.findOne({
        order: [
          ['onsetOfSymptoms', 'DESC']
        ]
      })
      const lastCaseDate = stateCase?.onsetOfSymptoms != null ? stateCase.onsetOfSymptoms : now
      const countOfLastCaseDate = await this.countEvents({ interval: { start: startOfDay(lastCaseDate), end: endOfDay(lastCaseDate) } })
      let adjustedCaseDate = lastCaseDate
      if (countOfLastCaseDate > 5) adjustedCaseDate = addDays(adjustedCaseDate, 1)
      return adjustedCaseDate
    }

    const firstDate = await decideOnDate()
    const casesAdded: StateCase[] = []
    for (let day = 0; day < numberOfDays; day++) {
      const newCaseDate = addDays(firstDate, day)
      for (let i = 0; i < numberPerDay; i++) {
        const stateCase = new StateCase()
        StateCaseTimeSeries.fakeStateCase(stateCase, newCaseDate)
        await stateCase.save()
        casesAdded.push(stateCase)
      }
    }
    return casesAdded
  }

  private static fakeStateCase (stateCase: StateCase, caseDate: Date): void {
    stateCase.personFirstName = faker.name.firstName()
    stateCase.personLastName = faker.name.lastName()
    stateCase.personAddress = faker.address.streetAddress()
    stateCase.personCity = faker.address.city()
    stateCase.personState = 'CA'
    stateCase.personPostalCode = faker.address.zipCodeByState('CA')
    stateCase.personPhone = faker.phone.number()
    stateCase.personEmail = faker.internet.email()
    stateCase.hospitalized = 'N'
    stateCase.subjectDied = 'N'

    stateCase.personDateOfBirth = faker.date.birthdate({ min: 5, max: 100, mode: 'age' })

    stateCase.onsetOfSymptoms = caseDate
  }
}
