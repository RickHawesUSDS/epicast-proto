import { StateCase } from '@/models/StateCase'
import { faker } from '@faker-js/faker'
import { addDays, set } from 'date-fns'
// import { getLogger } from 'log4js'

// const logger = getLogger('STATE_CASE_SERVICE')

function fakeStateCase (stateCase: StateCase, caseDate: Date): void {
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

export async function insertFakeStateCases (numberOfDays: number, numberPerDay: number): Promise<StateCase[]> {
  const lastCaseDate = await getLastCaseDate()
  const now = new Date()
  const adjustedCaseDate = set(lastCaseDate, { hours: now.getHours(), minutes: now.getMinutes(), seconds: now.getSeconds() })
  const casesAdded = []
  for (let day = 0; day < numberOfDays; day++) {
    const newCaseDate = addDays(adjustedCaseDate, day)
    for (let i = 0; i < numberPerDay; i++) {
      const stateCase = new StateCase()
      fakeStateCase(stateCase, newCaseDate)
      await stateCase.save()
      casesAdded.push(stateCase)
    }
  }
  return casesAdded
}

export async function getStateCases (sortDecending: boolean): Promise<StateCase[]> {
  const listOrder = sortDecending ? 'DESC' : 'ASC'
  return await StateCase.findAll({
    order: [
      ['onsetOfSymptoms', listOrder]
    ]
  })
}

export async function getLastCaseDate (): Promise<Date> {
  const stateCase = await StateCase.findOne({
    order: [
      ['onsetOfSymptoms', 'DESC']
    ]
  })
  return stateCase?.onsetOfSymptoms != null ? stateCase.onsetOfSymptoms : new Date()
}
