import express from 'express'
import { getLogger } from '@/utils/loggers'
import { getAllStateCases } from '@/controllers/getAllStateCases'
import { insertFakeStateCases } from '@/services/stateCaseService'
import asyncHandler from 'express-async-handler'

const router = express.Router()
const logger = getLogger('STATE_CASES_ROUTE')

/* GET get all cases. */
router.get('/', asyncHandler(async (req, res, _next) => {
  const sort = req.query.sort as string
  logger.info('Get all cases: sort=' + sort)

  const sortDecending = 'DESC'.localeCompare(sort, 'en', { sensitivity: 'base' }) === 0
  const cases = await getAllStateCases(sortDecending)
  res.send(cases)
}))

/* POST add a random new cases */
router.post('/random', asyncHandler(async (req, res, _next) => {
  let numPerDay = parseInt(req.query.numPerDay as string)
  let numOfDays = parseInt(req.query.numOfDays as string)
  if (isNaN(numPerDay)) numPerDay = 1
  if (isNaN(numOfDays)) numOfDays = 1
  logger.info(`Add random cases: ${numOfDays}, ${numPerDay}`)
  const stateCases = await insertFakeStateCases(numOfDays, numPerDay)
  res.send(stateCases)
}))

export default router
