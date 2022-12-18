import { describe, expect, test, beforeAll, beforeEach, afterAll } from '@jest/globals'
import { spec } from 'pactum'
import { app } from '../../server/app'

const caAgency = 'cphd.ca.gov'
const baseUrl = 'http://localhost:4001/api'

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
  test('add random case test', async () => {
    await spec()
      .post(`${baseUrl}/agencies/${caAgency}/random`)
      .expectStatus(200)

    await spec()
      .get(`${baseUrl}/agencies/${caAgency}`)
      .expectStatus(200)
      .expectJsonLength(1)

  })

  test('publish a random case test', async () => {
    await spec()
      .post(`${baseUrl}/agencies/${caAgency}/random`)
      .expectStatus(200)

    await spec()
      .get(`${baseUrl}/agencies/${caAgency}`)
      .expectStatus(200)
      .expectJsonLength(1)

    await spec()
      .post(`${baseUrl}/agencies/${caAgency}/publish`)
      .expectStatus(200)

    await spec()
      .get(`${baseUrl}/feeds/content?file=${caAgency}/cases/summary.yaml`)
      .expectStatus(200)
      .expectBodyContains('eventCount: 1')
      .expectBodyContains('topicId: cases')
      .expectBodyContains(`reporterId: ${caAgency}`)
  })
})

