import { addDays, addMonths, endOfDay, set, startOfDay, startOfMonth } from 'date-fns'
import { MongoTimeSeries, MongoTimeSeriesEvent } from './MongoTimeSeries'
import { faker } from '@faker-js/faker'
import { variableDictionaryElementNames } from './agencyModels'
import { getLogger } from '@/utils/loggers'

const logger = getLogger('INSERT_FAKE_CASES')

export async function insertFakeCases (timeSeries: MongoTimeSeries, numberOfDays: number, numberPerDay: number): Promise<MongoTimeSeriesEvent[]> {
  const decideOnDate = async (): Promise<Date> => {
    const now = new Date()
    if (numberOfDays * numberPerDay > 10000) {
      return startOfMonth(addMonths(now, 1))
    }
    const stateCase = await timeSeries.fetchLastEvent()
    const lastCaseDate = stateCase?.eventAt ?? now
    let adjustedCaseDate = set(new Date(lastCaseDate), { hours: now.getHours(), minutes: now.getMinutes(), seconds: now.getSeconds(), milliseconds: now.getMilliseconds() })
    const countOfLastCaseDate = await timeSeries.countEvents({ interval: { start: startOfDay(lastCaseDate), end: endOfDay(lastCaseDate) } })
    if (countOfLastCaseDate > 5) adjustedCaseDate = addDays(adjustedCaseDate, 1)
    return adjustedCaseDate
  }

  let duplicateCount = 0
  const generateNewCase = (newCaseDate: Date, lastCase?: MongoTimeSeriesEvent): MongoTimeSeriesEvent => {
    let sourceCase: MongoTimeSeriesEvent
    if (lastCase !== undefined && Math.random() < 0.2) {
      sourceCase = timeSeries.createEvent(lastCase)
      duplicateCount += 1
    } else {
      sourceCase = fakeCase(timeSeries, newCaseDate)
    }
    return sourceCase
  }

  const firstDate = await decideOnDate()
  const casesAdded: MongoTimeSeriesEvent[] = []
  for (let day = 0; day < numberOfDays; day++) {
    const newCaseDate = addDays(firstDate, day)
    let lastCase: MongoTimeSeriesEvent | undefined
    for (let i = 0; i < numberPerDay; i++) {
      const sourceCase = generateNewCase(newCaseDate, lastCase)
      casesAdded.push(sourceCase)
      lastCase = sourceCase
    }
  }
  await timeSeries.upsertEvents(casesAdded)
  logger.debug(`Duplicate cases added: ${duplicateCount}`)
  return casesAdded
}

function fakeCase (timeSeries: MongoTimeSeries, eventAt: Date): MongoTimeSeriesEvent {
  const sourceCase: any = {}
  sourceCase.uscdiPatientFirstName = faker.name.firstName()
  sourceCase.uscdiPatientLastName = faker.name.lastName()
  sourceCase.uscdiPatientAddress = faker.address.streetAddress()
  sourceCase.uscdiPatientCity = faker.address.city()
  sourceCase.uscdiPatientState = 'CA'
  sourceCase.uscdiPatientRaceCategory = sample(['White', 'Black or African American', 'American Indian or Alaska Native', 'Asian', 'Native Hawaiian'])
  sourceCase.uscdiPatientSexAtBirth = sample(['Male', 'Female'])
  sourceCase.uscdiPatientEthnicityGroup = sample(['Hispanic or Latino', 'Not Hispanic or Latino'])
  sourceCase.uscdiPatientPostalCode = faker.address.zipCodeByState('CA')
  sourceCase.uscdiPatientPhone = faker.phone.number()
  sourceCase.uscdiPatientEmail = faker.internet.email()
  sourceCase.cdcHospitalized = 'N'
  sourceCase.cdcSubjectDied = 'N'

  sourceCase.uscdiPatientDateOfBirth = faker.date.birthdate({ min: 5, max: 100, mode: 'age' })
  sourceCase.cdcOnsetOfSymptoms = eventAt

  sourceCase.eventAt = eventAt
  sourceCase.eventSubject = timeSeries.summary.subject
  sourceCase.eventReporter = timeSeries.summary.reporter
  sourceCase.eventTopic = timeSeries.summary.topic
  fakeVariableElements(timeSeries, sourceCase)
  return timeSeries.createEvent(sourceCase)
}

function fakeVariableElements (timeSeries: MongoTimeSeries, sourceCase: MongoTimeSeriesEvent): void {
  for (const variableElementName of variableDictionaryElementNames) {
    const index = timeSeries.dictionary.elements.findIndex(e => e.name === variableElementName)
    if (index !== -1) {
      sourceCase.set(variableElementName as keyof MongoTimeSeriesEvent, 'fake response')
    }
  }
}

function sample (codeset: string[]): string {
  const random = Math.floor(Math.random() * codeset.length)
  return codeset[random]
}
