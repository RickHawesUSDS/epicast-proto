import { describe, expect, test, beforeAll, beforeEach, afterAll } from '@jest/globals'
import { spec } from 'pactum'
import { app } from '../../server/app'

const caAgency = 'cphd.ca.gov'
const baseUrl = 'http://localhost:4001/api/agencies'

beforeAll(async () => {
  await app.start()
  await app.listen()
})

beforeEach(async () => {
  await app.clearStores()
})

afterAll(async () => {
  await app.close()
  await app.stop()
})

describe('agency tests', () => {
  test('add random test', async () => {
    await spec()
      .post(`${baseUrl}/${caAgency}/random`)
      .expectStatus(200)
  })
})

