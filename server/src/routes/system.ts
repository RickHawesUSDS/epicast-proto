import express from 'express';
import { getLogger } from '@/utils/loggers';
import  demoReset from '@/controllers/resetDemo'
const router = express.Router();
const logger = getLogger('SYSTEM_ROUTE');

/* Reset the system. */
router.post('/reset', (_req, res, _next) => {
  logger.info('reset system');
  demoReset();
  res.send('respond with a resource');
});

export default router;