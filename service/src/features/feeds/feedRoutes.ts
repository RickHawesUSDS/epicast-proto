import express from 'express'
import { getLogger } from '@/utils/loggers'
import { S3Bucket } from './S3Bucket'
import asyncHandler from 'express-async-handler'
const router = express.Router()
const logger = getLogger('FEED_ROUTE')

/* List the feed. */
router.get('/metadata', asyncHandler(async (req, res, _next) => {
  const prefix = req.query.prefix as string ?? ''
  logger.info(`list feed: ${prefix}`)
  const bucket = new S3Bucket()
  const fileArray = await bucket.getFileData(prefix)
  res.status(200).send(fileArray)
}))

/* Download a specific file */
router.get('/content', asyncHandler(async (req, res, _next) => {
  const file = req.query.file as string
  logger.info(`get file: ${file}`)
  const bucket = new S3Bucket()
  const fileContents = await bucket.getObject(file)
  res.status(200).send(fileContents)
}))

export default router
