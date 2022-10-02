import express from 'express';
import { getLogger } from '@/utils/loggers';
import { resetSystem } from '@/controllers/resetSystem'
const router = express.Router();
const logger = getLogger('SYSTEM_ROUTE');

/* Reset the system. */
router.post('/reset', async (_req, res, _next) => {
  logger.info('system reset');
  await resetSystem();
  res.send('Successful reset');
});

export default router;