import { faker } from '@faker-js/faker'
import { addDays, addMonths, endOfDay, startOfDay, startOfMonth } from 'date-fns'
import { Op, Order, WhereOptions } from 'sequelize'

import { StateCase } from '@/features/publishers/StateCase'
import { TimeSeries, TimeSeriesCountOptions, TimeSeriesFindOptions, TimeSeriesEvent, TimeSeriesMetadata } from '@/epicast/TimeSeries'
import { stateCaseTimeSeriesSchemaV1, variableSchemaElementNames } from './stateCaseElements'
import { MutableFeedSchema } from '@/epicast/FeedSchema'
import { FeedElement } from '@/epicast/FeedElement'
import { getLogger } from '@/utils/loggers'

const logger = getLogger('STATE_CASE_TIME_SERIES')

export class StateCaseTimeSeries implements TimeSeries<StateCase> {
  async findEvents (options: TimeSeriesFindOptions): Promise<StateCase[]> {
    const whereClause: WhereOptions<StateCase> = {}
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
    if (options.isDeleted !== undefined) {
      whereClause.isDeleted = options.isDeleted
    } else {
      whereClause.isDeleted = { [Op.not]: true }
    }

    const orderClause: Order = [
      ['caseDate', (options?.sortDescending ?? false) ? 'DESC' : 'ASC'],
      ['caseId', (options?.sortDescending ?? false) ? 'DESC' : 'ASC']
    ]
    return await StateCase.findAll({ where: whereClause, order: orderClause })
  }

  async countEvents (options: TimeSeriesCountOptions): Promise<number> {
    const where: WhereOptions<StateCase> = {}
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
    if (options.isDeleted !== undefined) {
      where.isDeleted = options.isDeleted
    } else {
      where.isDeleted = { [Op.not]: true }
    }
    return await StateCase.count({ where })
  }

  async fetchMetadata (): Promise<TimeSeriesMetadata | null> {
    const lastUpdated = await StateCase.findOne({ order: [['updatedAt', 'DESC']] })
    if (lastUpdated === null) return null
    const lastCase = await StateCase.findOne({ order: [['caseAt', 'DESC']] })
    if (lastCase === null) return null
    return { lastUpdatedAt: lastUpdated.updatedAt, lastEventAt: lastCase.caseDate }
  }

  makeTimeSeriesEvent (event: StateCase): TimeSeriesEvent<StateCase> {
    return event
  }

  schema = new MutableFeedSchema(stateCaseTimeSeriesSchemaV1)

  addFeedElement (element: FeedElement): boolean {
    return this.schema.addElement(element)
  }

  deleteFeedElement (name: string): boolean {
    return this.schema.deleteElement(name)
  }

  resetSchema (): void {
    this.schema = new MutableFeedSchema(stateCaseTimeSeriesSchemaV1)
  }

  async insertFakeStateCases (numberOfDays: number, numberPerDay: number): Promise<StateCase[]> {
    const decideOnDate = async (): Promise<Date> => {
      const now = new Date()
      if (numberOfDays * numberPerDay > 10000) {
        return startOfMonth(addMonths(now, 1))
      }
      const stateCase = await StateCase.findOne({
        order: [
          ['caseDate', 'DESC']
        ]
      })
      const lastCaseDate = stateCase?.caseDate != null ? stateCase.caseDate : now
      const countOfLastCaseDate = await this.countEvents({ interval: { start: startOfDay(lastCaseDate), end: endOfDay(lastCaseDate) } })
      let adjustedCaseDate = lastCaseDate
      if (countOfLastCaseDate > 5) adjustedCaseDate = addDays(adjustedCaseDate, 1)
      return adjustedCaseDate
    }

    let duplicateCount = 0
    const generateNewCase = (newCaseDate: Date, lastCase?: StateCase): StateCase => {
      let stateCase: StateCase
      if (lastCase !== undefined && Math.random() < 0.2) {
        stateCase = new StateCase()
        this.setStateCase(stateCase, lastCase)
        duplicateCount += 1
      } else {
        stateCase = new StateCase()
        this.fakeStateCase(stateCase, newCaseDate)
      }
      return stateCase
    }

    const firstDate = await decideOnDate()
    const casesAdded: StateCase[] = []
    for (let day = 0; day < numberOfDays; day++) {
      const newCaseDate = addDays(firstDate, day)
      let lastCase: StateCase | undefined
      for (let i = 0; i < numberPerDay; i++) {
        const stateCase = generateNewCase(newCaseDate, lastCase)
        await stateCase.save()
        casesAdded.push(stateCase)
        lastCase = stateCase
      }
    }
    logger.debug(`Duplicate cases added: ${duplicateCount}`)
    return casesAdded
  }

  async deduplicate (): Promise<void> {
    function isDuplicate (a: StateCase, b: StateCase): boolean {
      return a.personFirstName === b.personFirstName &&
        a.personLastName === b.personLastName &&
        a.personEmail === b.personEmail
    }

    async function findDuplicates (cases: StateCase[], found: (duplicate: StateCase, original: StateCase) => Promise<void>): Promise<number> {
      // This algorithm only works if duplicates are consecutive as is the case for our code
      let duplicateCount = 0
      for (let i = 0; i < cases.length; i++) {
        for (let j = i + 1; j < cases.length; j++) {
          if (isDuplicate(cases[i], cases[j])) {
            await found(cases[j], cases[i])
            duplicateCount += 1
          } else {
            i = j - 1 // increment will make this i = j on next loop
            break
          }
        }
      }
      return duplicateCount
    }

    logger.info('Deduplicating state cases')
    const cases = await this.findEvents({ sortDescending: false })
    const duplicateCount = await findDuplicates(cases, async (duplicate, original) => {
      duplicate.isDeleted = true
      duplicate.replacedBy = original.id
      await duplicate.save()
    })
    logger.debug(`Found duplicates: ${duplicateCount}`)
  }

  private fakeStateCase (stateCase: StateCase, caseDate: Date): void {
    stateCase.personFirstName = faker.name.firstName()
    stateCase.personLastName = faker.name.lastName()
    stateCase.personAddress = faker.address.streetAddress()
    stateCase.personCity = faker.address.city()
    stateCase.personState = 'CA'
    stateCase.personRace = StateCaseTimeSeries.sample(['White', 'Black or African American', 'American Indian or Alaska Native', 'Asian', 'Native Hawaiian'])
    stateCase.personSexAtBirth = StateCaseTimeSeries.sample(['Male', 'Female'])
    stateCase.personEthnicity = StateCaseTimeSeries.sample(['Hispanic or Latino', 'Not Hispanic or Latino'])
    stateCase.personPostalCode = faker.address.zipCodeByState('CA')
    stateCase.personPhone = faker.phone.number()
    stateCase.personEmail = faker.internet.email()
    stateCase.hospitalized = 'N'
    stateCase.subjectDied = 'N'

    stateCase.personDateOfBirth = faker.date.birthdate({ min: 5, max: 100, mode: 'age' })
    stateCase.onsetOfSymptoms = caseDate

    stateCase.caseDate = caseDate
    this.fakeVariableElements(stateCase)
  }

  private fakeVariableElements (stateCase: StateCase): void {
    for (const variableElementName of variableSchemaElementNames) {
      const index = this.schema.elements.findIndex(e => e.name === variableElementName)
      if (index !== -1) {
        stateCase.set(variableElementName as keyof StateCase, 'fake response')
      }
    }
  }

  private setStateCase (to: StateCase, from: StateCase): void {
    to.personFirstName = from.personFirstName
    to.personLastName = from.personLastName
    to.personAddress = from.personAddress
    to.personCity = from.personCity
    to.personState = from.personState
    to.personRace = from.personRace
    to.personSexAtBirth = from.personSexAtBirth
    to.personEthnicity = from.personEthnicity
    to.personPostalCode = from.personPostalCode
    to.personPhone = from.personPhone
    to.personEmail = from.personEmail
    to.hospitalized = from.hospitalized
    to.subjectDied = from.subjectDied
    to.personDateOfBirth = from.personDateOfBirth
    to.onsetOfSymptoms = from.onsetOfSymptoms
    to.caseDate = from.caseDate
    this.fakeVariableElements(to)
  }

  private static sample (codeset: string[]): string {
    const random = Math.floor(Math.random() * codeset.length)
    return codeset[random]
  }
}
