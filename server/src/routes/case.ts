import express from 'express';
import { getLogger } from '@/utils/loggers';
import { getAllCases } from '@/controllers/getAllCases';

const router = express.Router();
const logger = getLogger('CASES_ROUTE');

/* GET get all cases. */
router.get('/', async function (_req, res, _next) {
  logger.info("Get all cases")
  const cases = await getAllCases()
  res.send(cases);
});

export default router;