import { StateCase } from '@/models/StateCase'
import { faker } from '@faker-js/faker'
import { addDays, set } from 'date-fns'
import { Period } from '@/utils/Period'
import { FindAndCountOptions, Op, Order, WhereAttributeHash, WhereOptions } from 'sequelize'

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

interface FindStateCasesOptions {
  period?: Period
  after?: Date
  before?: Date
  updatedAfter?: Date
  sortDescending?: boolean
}

export async function findStateCases (options: FindStateCasesOptions): Promise<StateCase[]> {
  let where: WhereOptions<StateCase> = {}
  if (options.period !== undefined) {
    where.onsetOfSymptoms = { [Op.between]: [options.period.start, options.period.end] }
  } else if(options.after !== undefined) {
    where.onsetOfSymptoms = { [Op.gt]: options.after }
  } else if(options.before !== undefined) {
    where.onsetOfSymptoms = { [Op.lt]: options.before }
  }
  if (options.updatedAfter !== undefined) {
    where.updatedAt = { [Op.gt]: options.updatedAfter }
  }
  const order: Order = [['onsetOfSymptoms', (options?.sortDescending ?? false) ? 'DESC' : 'ASC']]
  return await StateCase.findAll({ where: where, order: order })
}
interface CountStateCasesOptions {
  period?: Period
  after?: Date
  before?: Date
  updatedAfter?: Date
}

export async function countStateCases(options: CountStateCasesOptions): Promise<number> {
  let where: WhereOptions<StateCase> = {}
  if (options.period !== undefined) {
    where.onsetOfSymptoms = { [Op.between]: [options.period.start, options.period.end] }
  } else if(options.after !== undefined) {
    where.onsetOfSymptoms = { [Op.gt]: options.after }
  } else if(options.before !== undefined) {
    where.onsetOfSymptoms = { [Op.lt]: options.before }
  }
  if (options.updatedAfter !== undefined) {
    where.updatedAt = { [Op.gt]: options.updatedAfter }
  }
  return await StateCase.count({where: where})
}

export async function getLastCaseDate (): Promise<Date> {
  const stateCase = await StateCase.findOne({
    order: [
      ['onsetOfSymptoms', 'DESC']
    ]
  })
  return stateCase?.onsetOfSymptoms != null ? stateCase.onsetOfSymptoms : new Date()
}
