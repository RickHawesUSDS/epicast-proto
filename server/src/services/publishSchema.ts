import { createReadStream } from 'fs'
import { getLogger } from 'log4js'

import { Feed } from '@/utils/Feed'
import { FeedLog } from './FeedLog'

const logger = getLogger('PUBLISH_SCHEMA_SERVICE')
const SCHEMA_NAME = 'schema/epicast-demoserver-feed1-schema.yaml'
const SCHEMA_TEMPLATE_PATH = './src/public/epicast-demoserver-feed1-schema.yaml'

export async function publishSchema(feed: Feed, log: FeedLog): Promise<void> {
  logger.info("publishing schema")
  const stream = createReadStream(SCHEMA_TEMPLATE_PATH, 'utf8')
  await feed.putObject(SCHEMA_NAME, stream)
  log.update(SCHEMA_NAME)
}
