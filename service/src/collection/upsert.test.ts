import {expect, test} from '@jest/globals'
import { upsert } from './upsert'

test('Add a value not present', () => {
  const array: number[] = [0, 1, 2]
  upsert(array, 3, (a, b) => a === b)
  expect(array).toEqual(expect.arrayContaining([0,1,2,3]))
})

test('Add a value present', () => {
  const array: number[] = [0, 1, 2]
  upsert(array, 1, (a, b) => a === b)
  expect(array).toEqual(expect.arrayContaining([0,1,2]))
})
