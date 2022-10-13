import { Feed } from '@/utils/Feed'
import { FeedLog } from './FeedLog'
import pathPosix from 'node:path/posix'
import { _Object } from '@aws-sdk/client-s3'
import { max as maxDate, parseISO, isAfter, isWithinInterval, differenceInMonths, isFuture, endOfDay } from 'date-fns'
import { findStateCases, findUpdatedStateCases, findStateCasesAfter, findAllStateCases } from '@/services/stateCaseService'
import { createReadStream } from 'fs'
import { StateCase } from '@/models/StateCase'
import { getLogger } from '@/utils/loggers'
import { Period, Frequency } from '@/utils/Period'
import { stringify } from 'csv-string'

const SCHEMA_NAME = 'schema/epicast-demoserver-feed1-schema.yaml'
const SCHEMA_TEMPLATE_PATH = './src/public/epicast-demoserver-feed1-schema.yaml'
const TIMESERIES_FOLDER = 'time_series'
const DESIRED_MAX_PER_PERIOD = 10000
const EARLY_DATE = parseISO('19000101')
const CSV_EXT = 'csv'

const logger = getLogger('PUBLISH_FEED_SERVICE')

interface CasePartion {
  period: Period
  cases: StateCase[]
}

export async function publishStateCaseFeed (feed: Feed): Promise<void> {
  const log = await FeedLog.read(feed)
  await publishSchema(feed, log)
  await publishStateCaseTables(feed, log)
  await log.write(feed)
}

async function publishSchema (feed: Feed, log: FeedLog): Promise<void> {
  const stream = createReadStream(SCHEMA_TEMPLATE_PATH, 'utf8')
  await feed.putObject(SCHEMA_NAME, stream)
  log.update(SCHEMA_NAME)
}

async function publishStateCaseTables (feed: Feed, log: FeedLog): Promise<void> {
  await updatePublishedPartions(feed, log)
  const lastReportedPeriod = await findLastPublishedPeriod(feed)
  logger.debug(`last published period: ${lastReportedPeriod ?? ""}`)
  await publishNewPartitions(feed, lastReportedPeriod, log)
}

async function updatePublishedPartions (feed: Feed, log: FeedLog): Promise<void> {
  const publishedObjects = await feed.listObjects(TIMESERIES_FOLDER)
  if (publishedObjects.length === 0) return // early shortcut
  const lastPublishDate = calcMaxLastModified(publishedObjects)

  for (const publishedObject of publishedObjects) {
    const period = periodFromObjectKey(publishedObject.Key)
    const isPeriodUpdated = await hasUpdates(period, lastPublishDate)
    if (isPeriodUpdated) {
      const periodCases = await findStateCases(period)
      if (period.frequency === Frequency.MONTHLY && periodCases.length > DESIRED_MAX_PER_PERIOD) {
        await replaceMonthlyWithDaily(period, periodCases, log)
      } else {
        await updatePartition(period, periodCases, log)
      }
    }
  }
  return

  async function hasUpdates (period: Period, after?: Date): Promise<boolean> {
    let updatedCases: StateCase[]
    if (after !== undefined) {
      updatedCases = await findUpdatedStateCases(period, after)
    } else {
      updatedCases = await findStateCases(period)
    }
    return updatedCases.length > 0
  }

  async function updatePartition (period: Period, periodCases: StateCase[], log: FeedLog): Promise<void> {
    const key = objectKeyFromPeriod(period)
    await putPartition(feed, key, periodCases)
    log.update(key)
  }

  async function replaceMonthlyWithDaily (publishedPeriod: Period, stateCases: StateCase[], log: FeedLog): Promise<void> {
    let endDate = publishedPeriod.end
    if (isFuture(publishedPeriod.end)) {
      endDate = endOfDay(maxDate([stateCases.at(-1)?.onsetOfSymptoms ?? new Date(), new Date()]))
    }
    const partitions = makeCasePartions(stateCases, publishedPeriod.start, endDate, Frequency.DAILY)
    const newKeys: string[] = []
    for (const partition of partitions) {
      const key = objectKeyFromPeriod(partition.period)
      await putPartition(feed, key, partition.cases)
      newKeys.push(key)
    }
    const oldKey = objectKeyFromPeriod(publishedPeriod)
    await feed.deleteObject(oldKey)
    log.replace(oldKey, newKeys)
  }
}

async function findLastPublishedPeriod (feed: Feed): Promise<Period | null> {
  const publishedObjects = await feed.listObjects(TIMESERIES_FOLDER)
  return calcLastPeriod(publishedObjects)
}

async function publishNewPartitions (feed: Feed, lastPublishedPeriod: Period | null, log: FeedLog): Promise<void> {
  let stateCases: StateCase[]
  let startDate: Date
  let endDate: Date
  let frequency: Frequency
  if (lastPublishedPeriod === null) {
    stateCases = await findAllStateCases()
    startDate = stateCases.at(0)?.onsetOfSymptoms ?? new Date()
    endDate = stateCases.at(-1)?.onsetOfSymptoms ?? new Date()
    frequency = decideOnFrequency(stateCases, Frequency.MONTHLY)
  } else {
    startDate = lastPublishedPeriod.nextPeriod().start
    stateCases = await findStateCasesAfter(startDate)
    if (stateCases.length === 0) return // short cut the work
    endDate = stateCases.at(-1)?.onsetOfSymptoms ?? new Date()
    frequency = decideOnFrequency(stateCases, lastPublishedPeriod.frequency)
  }
  const partitions = makeCasePartions(stateCases, startDate, endDate, frequency)
  for (const partition of partitions) {
    const key = objectKeyFromPeriod(partition.period)
    await putPartition(feed, key, partition.cases)
    log.add(key)
  }
}

function decideOnFrequency (stateCases: StateCase[], lastFrequency: Frequency): Frequency {
  if (stateCases.length === 0) return lastFrequency
  const months = differenceInMonths(stateCases.at(0)?.onsetOfSymptoms ?? new Date(), stateCases.at(-1)?.onsetOfSymptoms ?? new Date())
  if (months === 0) return lastFrequency
  return stateCases.length / months > DESIRED_MAX_PER_PERIOD ? Frequency.DAILY : lastFrequency
}

async function putPartition (feed: Feed, key: string, cases: StateCase[]): Promise<void> {
  function createCSV (cases: StateCase[]): string {
    const columns = Object.keys(StateCase.getAttributes())
    const csv = cases.map(stateCase => {
      const values = columns.map(column => stateCase.getDataValue(column as keyof StateCase) as string ?? '')
      return stringify(values)
    })
    csv.unshift(stringify(columns))
    return csv.join('')
  }

  const report = createCSV(cases)
  await feed.putObject(key, report)
  logger.info(`Publish an object: ${key}`)
}

function makeCasePartions (stateCases: StateCase[], startDate: Date, endDate: Date, frequency: Frequency): CasePartion[] {
  const partions: CasePartion[] = []
  let partitionPeriod = new Period(startDate, frequency)
  while (!isAfter(partitionPeriod.start, endDate)) {
    const partitionCases = findCasesForPeriod(stateCases, partitionPeriod)
    partions.push({ period: partitionPeriod, cases: partitionCases })
    partitionPeriod = partitionPeriod.nextPeriod()
  }
  return partions
}

function findCasesForPeriod (stateCases: StateCase[], period: Period): StateCase[] {
  return stateCases.filter(stateCase => { return isWithinInterval(stateCase.onsetOfSymptoms, period.interval) })
}

function periodFromObjectKey (key: string | undefined): Period {
  if (key === undefined) throw Error('Object key is undefined')
  const periodPart = pathPosix.parse(key).name
  return Period.parse(periodPart)
}

function fileNameFromPeriod (period: Period): string {
  return `${period.toString()}.${CSV_EXT}`
}

function objectKeyFromPeriod (period: Period): string {
  const fileName = fileNameFromPeriod(period)
  return `${TIMESERIES_FOLDER}/${fileName}`
}

function calcMaxLastModified (objects: _Object[]): Date | undefined {
  if (objects.length) return undefined
  const modifiedDates = objects.map((object) => { return object.LastModified ?? EARLY_DATE })
  return maxDate(modifiedDates)
}

function calcLastPeriod (publishedObjects: _Object[]): Period | null {
  if (publishedObjects.length === 0) return null
  let lastPeriod = periodFromObjectKey(publishedObjects.at(0)?.Key)
  for (const publishedObject of publishedObjects) {
    const period = periodFromObjectKey(publishedObject.Key)
    if (isAfter(period.start, lastPeriod.start)) {
      lastPeriod = period
    }
  }
  return lastPeriod
}
