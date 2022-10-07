import { StateCase } from '@/models/StateCase';
import { faker } from '@faker-js/faker';
import { addDays, set } from 'date-fns'
import { getLogger } from 'log4js';

const MAX_NUMBER_OF_CASES_PER_DAY = 8
const logger = getLogger("STATE_CASE_SERVICE")

function fakeStateCase(stateCase: StateCase, caseDate: Date) {
  stateCase.personFirstName = faker.name.firstName()
  stateCase.personLastName = faker.name.lastName()
  stateCase.personAddress = faker.address.streetAddress()
  stateCase.personCity = faker.address.city()
  stateCase.personState = "CA"
  stateCase.personPostalCode = faker.address.zipCodeByState("CA")
  stateCase.personPhone = faker.phone.number()
  stateCase.personEmail = faker.internet.email()
  stateCase.hospitalized = "N"
  stateCase.subjectDied = "N"

  stateCase.personDateOfBirth = faker.date.birthdate({ min: 5, max: 100, mode: 'age'})

  stateCase.onsetOfSymptoms = caseDate
}

function randomBetween(min: number, max: number): number {
  return Math.floor(
    Math.random() * (max - min) + min
  )
}

export async function insertManyFakeStateCases(numberOfDays: number) {
  const lastCaseDate = await getLastCaseDate()
  for(let i = 0; i < numberOfDays; i++) {
    const numberOfCases = randomBetween(0, MAX_NUMBER_OF_CASES_PER_DAY)
    const newCaseDate = addDays(lastCaseDate, i)
    for(let j = 0; j < numberOfCases; j++) {
      logger.debug("case date: " + newCaseDate.toISOString() + ", " + i)
      const stateCase = new StateCase()
      fakeStateCase(stateCase, newCaseDate)
      await stateCase.save()
    }
  }
}

export async function insertSingleFakeStateCase(): Promise<StateCase> {
  const lastCaseDate = await getLastCaseDate()
  const now = new Date()
  const caseDate = set(lastCaseDate, { hours: now.getHours(), minutes: now.getMinutes(), seconds: now.getSeconds() })
  const stateCase = new StateCase()
  fakeStateCase(stateCase, caseDate)
  return await stateCase.save()
}

export async function getStateCases(sortDecending: boolean): Promise<StateCase[]> {
  const listOrder = sortDecending ? "DESC" : "ASC"
  return await StateCase.findAll({
    order: [
      ["onsetOfSymptoms", listOrder],
    ]
  })
}

export async function getLastCaseDate(): Promise<Date> {
  const stateCase = await StateCase.findOne({
    order: [
      ["onsetOfSymptoms", "DESC"],
    ]
  })
  return stateCase?.onsetOfSymptoms || new Date()
}
