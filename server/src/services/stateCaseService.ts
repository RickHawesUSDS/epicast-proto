import { StateCase } from '@/models/StateCase';
import { faker } from '@faker-js/faker';

const MAX_NUMBER_OF_CASES_PER_DAY = 8

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
    const newCaseDate = new Date(lastCaseDate)
    newCaseDate.setDate(lastCaseDate.getDate() + i)
    for(let j = 0; j < numberOfCases; j++) {
      const stateCase = new StateCase()
      fakeStateCase(stateCase, newCaseDate)
      await stateCase.save()
    }
  }
}

export async function insertSingleFakeStateCase(): Promise<StateCase> {
  const caseDate = await getLastCaseDate()
  const stateCase = new StateCase()
  fakeStateCase(stateCase, caseDate)
  return await stateCase.save()
}

export async function getLastCaseDate(): Promise<Date> {
  const stateCase = await StateCase.findOne({
    order: [
      ["onsetOfSymptoms", "DESC"],
    ]
  })
  return stateCase?.onsetOfSymptoms || new Date()
}
