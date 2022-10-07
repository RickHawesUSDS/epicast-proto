import express from 'express';
import { getLogger } from '@/utils/loggers';
import { getAllStateCases } from '@/controllers/getAllStateCases'
import { addRandomStateCase } from '@/controllers/addRandomStateCase';

const router = express.Router();
const logger = getLogger('STATE_CASES_ROUTE');

/* GET get all cases. */
router.get('/', async function (req: express.Request, res: express.Response, _next) {
  logger.info("Get all cases")
  const cases = await getAllStateCases("DESC")
  res.send(cases);
})

/* POST add a random new cases */
router.post('/random', async function(_req, res, _next) {
  logger.info("Add a random case")
  const stateCase = await addRandomStateCase()
  res.send(stateCase)
})

export default router;
