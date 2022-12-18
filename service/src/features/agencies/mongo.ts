import { MongoClient, Db } from 'mongodb'
import { getLogger } from '@/server/loggers'

const logger = getLogger('MONGO')

export const client = new MongoClient(process.env.MONGO_URI ?? '')
client.on('commandStarted', (event) => logger.debug(event))
client.on('commandSucceeded', (event) => logger.debug(event))
client.on('commandFailed', (event) => logger.debug(event))

export async function attachToDb(): Promise<Db> {
  logger.info('Connecting to Mongo...')
  await client.connect()
  await client.db('admin').command({ ping: 1 })
  return client.db('epicast_demo')
}

export { Db }
