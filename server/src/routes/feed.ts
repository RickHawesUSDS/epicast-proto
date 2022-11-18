import express from 'express'
import { getLogger } from '@/utils/loggers'
import { S3Bucket } from '@/utils/S3Bucket'
import asyncHandler from 'express-async-handler'
const router = express.Router()
const logger = getLogger('FEED_ROUTE')

/* Reset the system. */
router.get('/', asyncHandler(async (req, res, _next) => {
  const prefix = req.query.prefix as string ?? ''
  logger.info(`get feed: ${prefix}`)
  const bucket = new S3Bucket()
  const fileArray = await bucket.getFileData(prefix)
  res.status(200).send(fileArray)
}))

export default router
