import { faker } from '@faker-js/faker'
import { addDays, addMonths, endOfDay, set, startOfDay, startOfMonth } from 'date-fns'
import { stateCaseDictionary, variableDictionaryElementNames } from './stateCaseDictionary'
import { getLogger } from '@/utils/loggers'
import { FeedSummary } from '@/epicast/FeedSummary'
import { MongoTimeSeries } from './MongoTimeSeries'
import { MongoTimeSeriesEvent } from './MongoTimeSeriesEvent'

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

export class StateCaseTimeSeries extends MongoTimeSeries {
  lastCaseNumber = 1

  constructor () {
    super('stateCases', stateCaseDictionary, initialFeedSummary)
  }

  async insertFakeStateCases (numberOfDays: number, numberPerDay: number): Promise<MongoTimeSeriesEvent[]> {
    const decideOnDate = async (): Promise<Date> => {
      const now = new Date()
      if (numberOfDays * numberPerDay > 10000) {
        return startOfMonth(addMonths(now, 1))
      }
      const stateCase = await this.fetchLastEvent()
      const lastCaseDate = stateCase?.eventAt ?? now
      let adjustedCaseDate = set(new Date(lastCaseDate), { hours: now.getHours(), minutes: now.getMinutes(), seconds: now.getSeconds(), milliseconds: now.getMilliseconds() })
      const countOfLastCaseDate = await this.countEvents({ interval: { start: startOfDay(lastCaseDate), end: endOfDay(lastCaseDate) } })
      if (countOfLastCaseDate > 5) adjustedCaseDate = addDays(adjustedCaseDate, 1)
      return adjustedCaseDate
    }

    let duplicateCount = 0
    const generateNewCase = (newCaseDate: Date, lastCase?: MongoTimeSeriesEvent): MongoTimeSeriesEvent => {
      let stateCase: MongoTimeSeriesEvent
      if (lastCase !== undefined && Math.random() < 0.2) {
        stateCase = new MongoTimeSeriesEvent()
        this.setStateCase(stateCase, lastCase)
        duplicateCount += 1
      } else {
        stateCase = new MongoTimeSeriesEvent()
        this.fakeStateCase(stateCase, newCaseDate)
      }
      stateCase.eventId = `CA${this.lastCaseNumber++}`
      return stateCase
    }

    const firstDate = await decideOnDate()
    const casesAdded: MongoTimeSeriesEvent[] = []
    for (let day = 0; day < numberOfDays; day++) {
      const newCaseDate = addDays(firstDate, day)
      let lastCase: MongoTimeSeriesEvent | undefined
      for (let i = 0; i < numberPerDay; i++) {
        const stateCase = generateNewCase(newCaseDate, lastCase)
        casesAdded.push(stateCase)
        lastCase = stateCase
      }
    }
    await this.upsertEvents(casesAdded)
    logger.debug(`Duplicate cases added: ${duplicateCount}`)
    return casesAdded
  }

  async deduplicate (): Promise<void> {
    function isDuplicate (a: MongoTimeSeriesEvent, b: MongoTimeSeriesEvent): boolean {
      return a.uscdiPatientFirstName === b.uscdiPatientFirstName &&
        a.uscdiPatientLastName === b.uscdiPatientLastName &&
        a.uscdiPatientEmail === b.uscdiPatientEmail
    }

    async function findDuplicates (cases: MongoTimeSeriesEvent[], found: (duplicate: MongoTimeSeriesEvent, original: MongoTimeSeriesEvent) => Promise<void>): Promise<number> {
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
    const events = await this.fetchAllEvents()
    const duplicateCount = await findDuplicates(events, async (duplicate, original) => {
      duplicate.eventIsDeleted = true
      duplicate.eventReplacedBy = original.eventId
      await duplicate.save()
    })
    logger.debug(`Found duplicates: ${duplicateCount}`)
  }

  private fakeStateCase (stateCase: MongoTimeSeriesEvent, eventAt: Date): void {
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

  private fakeVariableElements (stateCase: MongoTimeSeriesEvent): void {
    for (const variableElementName of variableDictionaryElementNames) {
      const index = this.dictionary.elements.findIndex(e => e.name === variableElementName)
      if (index !== -1) {
        stateCase.set(variableElementName as keyof MongoTimeSeriesEvent, 'fake response')
      }
    }
  }

  private setStateCase (to: MongoTimeSeriesEvent, from: MongoTimeSeriesEvent): void {
    Object.assign(to, from)
  }

  private static sample (codeset: string[]): string {
    const random = Math.floor(Math.random() * codeset.length)
    return codeset[random]
  }
}
