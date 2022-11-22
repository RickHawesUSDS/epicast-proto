import { FeedBucket } from '@/epicast/FeedBucket'
import { getLogger } from '@/utils/loggers'

const logger = getLogger('RESET_STORAGE')

export async function resetStorage (feed: FeedBucket): Promise<void> {
  logger.info('Resetting storage')
  const bucketObjects = await feed.listObjects('')
  for (const bucketObject of bucketObjects) {
    await feed.deleteObject(bucketObject.key)
  }
}
