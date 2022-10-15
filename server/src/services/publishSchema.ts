import { readFileSync } from 'fs'
import { getLogger } from 'log4js'

import { Feed } from '@/utils/Feed'
import { FeedLog } from './FeedLog'

const logger = getLogger('PUBLISH_SCHEMA_SERVICE')
const SCHEMA_NAME = 'schema/epicast-demoserver-feed1-schema.yaml'
const SCHEMA_TEMPLATE_PATH = './src/public/epicast-demoserver-feed1-schema.yaml'

export async function publishSchema (feed: Feed, log: FeedLog): Promise<void> {
  if (!await feed.doesObjectExist(SCHEMA_NAME)) {
    logger.info('publishing schema')
    const rawSchema = readFileSync(SCHEMA_TEMPLATE_PATH, { encoding: 'utf8' })
    await feed.putObject(SCHEMA_NAME, rawSchema)
    log.add(SCHEMA_NAME)
  }
}
