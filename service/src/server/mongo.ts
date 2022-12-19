import { MongoClient, Db } from 'mongodb'
import { getLogger } from './loggers'

const logger = getLogger('MONGO')
let client: MongoClient

export async function attachToDb (): Promise<Db> {
  if (process.env.MONGO_URI === undefined) throw new Error('No MONGO_URI environment')
  if (process.env.MONGO_DB === undefined) throw new Error('No MONGO_DB environment')
  client = new MongoClient(process.env.MONGO_URI)
  client.on('commandStarted', (event) => logger.debug(event))
  client.on('commandSucceeded', (event) => logger.debug(event))
  client.on('commandFailed', (event) => logger.debug(event))

  logger.info('Connecting to Mongo...')
  await client.connect()
  await client.db('admin').command({ ping: 1 })
  return client.db(process.env.MONGO_DB)
}

export async function dropCollections (db: Db, except?: string[]): Promise<void> {
  for (const collection of await db.collections()) {
    const name = collection.collectionName
    if (except !== undefined && except.indexOf(name) !== -1) continue
    logger.info(`Dropping collection: ${name}`)
    await collection.drop()
  }
}

export async function disconnectToDb (): Promise<void> {
  await client.close()
}
