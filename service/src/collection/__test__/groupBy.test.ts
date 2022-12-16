import { groupBy } from '../groupBy'
import { test, expect } from '@jest/globals'

interface X {
  value: number
}

test('Group by exercise for number', () => {
  const array: X[] = [{ value: 1}, {value: 2}, {value: 3}, {value: 4}]
  const groupByMap = groupBy(array, x => x.value.toString())
  expect(groupByMap).toMatchObject(new Map({1: [{value: 1}], 2: [{value: 2}], 3: [{value: 3}], 4: [{value: 4}]}))
})
