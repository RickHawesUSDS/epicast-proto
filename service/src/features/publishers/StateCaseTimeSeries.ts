import { faker } from '@faker-js/faker'
import { addDays, addMonths, endOfDay, set, startOfDay, startOfMonth } from 'date-fns'
import { Op, Order, WhereOptions } from 'sequelize'

import { StateCase } from '@/features/publishers/StateCase'
import { TimeSeries, TimeSeriesCountOptions, TimeSeriesFindOptions, TimeSeriesMetadata } from '@/epicast/TimeSeries'
import { stateCaseDictionary, variableDictionaryElementNames } from './stateCaseDictionary'
import { MutableFeedDictionary } from '@/epicast/FeedDictionary'
import { FeedElement } from '@/epicast/FeedElement'
import { getLogger } from '@/utils/loggers'
import { FeedSummary } from '@/epicast/FeedSummary'

const logger = getLogger('STATE_CASE_TIME_SERIES')

export const initialFeedSummary: FeedSummary = {
  epicastVersion: '0.1',
  subject: 'us_ca',
  reporter: 'caphd',
  topic: 'cases',
  sourceUrl: 'xyz',
  sourceFeeds: [],
  descriptions: [{
    isoCultureCode: 'en-us',
    subjectFullName: 'USA California',
    reporterFullName: 'California Public Health Department',
    topicFullName: 'Demo cases',
    feedDetails: 'This a fake feed for demonstration purposes'
  }],
  contacts: [{ email: 'xyz@dummy.com' }]
}

export class StateCaseTimeSeries implements TimeSeries {
  lastCaseNumber = 1

  async fetchEvents (options: TimeSeriesFindOptions): Promise<StateCase[]> {
    const whereClause: WhereOptions<StateCase> = {}
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
    if (options.isDeleted !== undefined) {
      whereClause.eventIsDeleted = options.isDeleted
    } else {
      whereClause.eventIsDeleted = { [Op.not]: true }
    }

    const orderClause: Order = [
      ['eventAt', (options?.sortDescending ?? false) ? 'DESC' : 'ASC'],
      ['eventId', (options?.sortDescending ?? false) ? 'DESC' : 'ASC']
    ]
    return await StateCase.findAll({ where: whereClause, order: orderClause })
  }

  async countEvents (options: TimeSeriesCountOptions): Promise<number> {
    const where: WhereOptions<StateCase> = {}
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
    if (options.isDeleted !== undefined) {
      where.eventIsDeleted = options.isDeleted
    } else {
      where.eventIsDeleted = { [Op.not]: true }
    }
    return await StateCase.count({ where })
  }

  async fetchMetadata (): Promise<TimeSeriesMetadata | null> {
    const lastUpdatedEvent = await StateCase.findOne({ order: [['eventUpdatedAt', 'DESC']] })
    if (lastUpdatedEvent === null) return null
    const lastEvent = await StateCase.findOne({ order: [['eventAt', 'DESC']] })
    if (lastEvent === null) return null
    const firstEvent = await StateCase.findOne({ order: [['eventAt', 'ASC']] })
    if (firstEvent === null) return null
    const count = await StateCase.count({ where: { eventIsDeleted: { [Op.not]: true } } })
    return {
      count,
      updatedAt: lastUpdatedEvent.eventUpdatedAt,
      firstEventAt: firstEvent.eventAt,
      lastEventAt: lastEvent.eventAt
    }
  }

  summary = initialFeedSummary

  dictionary = new MutableFeedDictionary(stateCaseDictionary)

  addFeedElement (element: FeedElement): boolean {
    return this.dictionary.addElement(element)
  }

  deleteFeedElement (name: string): boolean {
    return this.dictionary.deleteElement(name)
  }

  resetDictionary (): void {
    this.dictionary = new MutableFeedDictionary(stateCaseDictionary)
  }

  async insertFakeStateCases (numberOfDays: number, numberPerDay: number): Promise<StateCase[]> {
    const decideOnDate = async (): Promise<Date> => {
      const now = new Date()
      if (numberOfDays * numberPerDay > 10000) {
        return startOfMonth(addMonths(now, 1))
      }
      const stateCase = await StateCase.findOne({
        order: [
          ['eventAt', 'DESC']
        ]
      })
      const lastCaseDate = stateCase?.eventAt != null ? stateCase.eventAt : now
      let adjustedCaseDate = set(new Date(lastCaseDate), { hours: now.getHours(), minutes: now.getMinutes(), seconds: now.getSeconds(), milliseconds: now.getMilliseconds() })
      const countOfLastCaseDate = await this.countEvents({ interval: { start: startOfDay(lastCaseDate), end: endOfDay(lastCaseDate) } })
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
      stateCase.eventId = `CA${this.lastCaseNumber++}`
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
      return a.uscdiPatientFirstName === b.uscdiPatientFirstName &&
        a.uscdiPatientLastName === b.uscdiPatientLastName &&
        a.uscdiPatientEmail === b.uscdiPatientEmail
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
    const cases = await this.fetchEvents({ sortDescending: false })
    const duplicateCount = await findDuplicates(cases, async (duplicate, original) => {
      duplicate.eventIsDeleted = true
      duplicate.eventReplacedBy = original.eventId
      await duplicate.save()
    })
    logger.debug(`Found duplicates: ${duplicateCount}`)
  }

  private fakeStateCase (stateCase: StateCase, eventAt: Date): void {
    stateCase.uscdiPatientFirstName = faker.name.firstName()
    stateCase.uscdiPatientLastName = faker.name.lastName()
    stateCase.uscdiPatientAddress = faker.address.streetAddress()
    stateCase.uscdiPatientCity = faker.address.city()
    stateCase.uscdiPatientState = 'CA'
    stateCase.uscdiPatientRaceCategory = StateCaseTimeSeries.sample(['White', 'Black or African American', 'American Indian or Alaska Native', 'Asian', 'Native Hawaiian'])
    stateCase.uscdiPatientSexAtBirth = StateCaseTimeSeries.sample(['Male', 'Female'])
    stateCase.uscdiPatientEthnicityGroup = StateCaseTimeSeries.sample(['Hispanic or Latino', 'Not Hispanic or Latino'])
    stateCase.uscdiPatientPostalCode = faker.address.zipCodeByState('CA')
    stateCase.uscdiPatientPhone = faker.phone.number()
    stateCase.uscdiPatientEmail = faker.internet.email()
    stateCase.cdcHospitalized = 'N'
    stateCase.cdcSubjectDied = 'N'

    stateCase.uscdiPatientDateOfBirth = faker.date.birthdate({ min: 5, max: 100, mode: 'age' })
    stateCase.cdcOnsetOfSymptoms = eventAt

    stateCase.eventAt = eventAt
    stateCase.eventSubject = 'epicast'
    stateCase.eventReporter = 'demo'
    stateCase.eventTopic = 'feed1'
    this.fakeVariableElements(stateCase)
  }

  private fakeVariableElements (stateCase: StateCase): void {
    for (const variableElementName of variableDictionaryElementNames) {
      const index = this.dictionary.elements.findIndex(e => e.name === variableElementName)
      if (index !== -1) {
        stateCase.set(variableElementName as keyof StateCase, 'fake response')
      }
    }
  }

  private setStateCase (to: StateCase, from: StateCase): void {
    Object.assign(to, from)
  }

  private static sample (codeset: string[]): string {
    const random = Math.floor(Math.random() * codeset.length)
    return codeset[random]
  }
}
