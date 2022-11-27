import express from 'express'
import { getLogger } from '@/utils/loggers'
import asyncHandler from 'express-async-handler'
import { getFeedStorage } from '@/server/app'
const router = express.Router()
const logger = getLogger('FEED_ROUTE')

/* List the feed. */
router.get('/metadata', asyncHandler(async (req, res, _next) => {
  const prefix = req.query.prefix as string ?? ''
  logger.info(`list feed: ${prefix}`)
  const storage = getFeedStorage(req)
  const fileArray = await storage.getFileData(prefix)
  res.status(200).send(fileArray)
}))

/* Download a specific file */
router.get('/content', asyncHandler(async (req, res, _next) => {
  const file = req.query.file as string
  logger.info(`get file: ${file}`)
  const storage = getFeedStorage(req)
  const fileContents = await storage.getObject(file)
  res.status(200).send(fileContents)
}))

export default router
