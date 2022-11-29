import { MongoClient, Db } from 'mongodb'
import { getLogger } from '@/utils/loggers'

const MONGODB_URI = 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=demoserver'

const logger = getLogger('MONGO')

export const client = new MongoClient(MONGODB_URI)
client.on('commandStarted', (event) => logger.debug(event))
client.on('commandSucceeded', (event) => logger.debug(event))
client.on('commandFailed', (event) => logger.debug(event))

export async function attachToDb (): Promise<Db> {
  logger.info('Connecting to Mongo...')
  await client.connect()
  await client.db('admin').command({ ping: 1 })
  return client.db('epicast_demo')
}
