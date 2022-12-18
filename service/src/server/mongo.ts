import { MongoClient, Db } from 'mongodb'
import { getLogger } from '@/server/loggers'

const logger = getLogger('MONGO')

export async function attachToDb(): Promise<Db> {
  const client = new MongoClient(process.env.MONGO_URI ?? '')
  client.on('commandStarted', (event) => logger.debug(event))
  client.on('commandSucceeded', (event) => logger.debug(event))
  client.on('commandFailed', (event) => logger.debug(event))

  logger.info('Connecting to Mongo...')
  await client.connect()
  await client.db('admin').command({ ping: 1 })
  return client.db(process.env.MONGO_DB ?? '')
}
