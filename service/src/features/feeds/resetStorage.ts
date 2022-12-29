import { FeedStorage } from '../../epicast/FeedStorage'
import { getLogger } from '../../server/loggers'

const logger = getLogger('RESET_STORAGE')

export async function resetStorage (feed: FeedStorage): Promise<void> {
  logger.info('Resetting storage')
  await feed.clearAll()
}
