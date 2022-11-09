import { formAggregatesKey } from '@/models/feedBucketKeys'
import { MutableSnapshot } from '@/models/Snapshot'
import { TimeSeries } from '@/models/TimeSeries'
import { makeCasePartions, TimeSeriesPartition } from '@/models/TimeSeriesPartition'
import { Frequency } from '@/utils/Frequency'
import { getLogger } from '@/utils/loggers'
import { stringify } from 'csv-string'
import { formatISO } from 'date-fns'

const logger = getLogger('PUBLISH_AGREGATES_SERVICE')

export async function publishAggregates<T> (toSnapshot: MutableSnapshot, fromTimeSeries: TimeSeries<T>): Promise<void> {
  const publisher = new AggregatesPublisher(toSnapshot, fromTimeSeries)
  await publisher.publish()
}

class AggregatesPublisher<T> {
  snapshot: MutableSnapshot
  timeSeries: TimeSeries<T>

  constructor (toSnapshot: MutableSnapshot, fromTimeSeries: TimeSeries<T>) {
    this.snapshot = toSnapshot
    this.timeSeries = fromTimeSeries
  }

  async publish (): Promise<void> {
    logger.info('Publishing an aggregate')
    const events = await this.timeSeries.findEvents({ sortDescending: false })
    if (events.length === 0) return
    const timeSeriesEvents = events.map(e => this.timeSeries.makeTimeSeriesEvent(e))
    const partitions = makeCasePartions(timeSeriesEvents, Frequency.DAILY)
    const partitionsByYear = this.groupByYear(partitions)
    for (let [year, yearPartition] of partitionsByYear) {
      await this.publishDailyCounts(year, yearPartition)
    }
  }

  async publishDailyCounts<T>(year: number, partitions: Array<TimeSeriesPartition<T>>): Promise<void> {
    const subject = this.timeSeries.schema.subjectId
    const reporter = this.timeSeries.schema.reporterId

    function createCSV (partitions: Array<TimeSeriesPartition<T>>): string {
      const csv = partitions.map(partition => {
        const values = [subject, reporter, formatISO(partition.period.start), formatISO(partition.period.end), partition.events.length]
        return stringify(values)
      })
      csv.unshift(stringify(['subject', 'reporter', 'period-start', 'period-end', 'count']))
      return csv.join('')
    }

    const schema = this.timeSeries.schema
    const key = formAggregatesKey(schema.subjectId, schema.reporterId, schema.feedId, year)
    const report = createCSV(partitions)
    await this.snapshot.putObject(key, report)
  }

  // Modern JavaScript will have a group operator that will replace this work
  groupByYear(partitions: TimeSeriesPartition<T>[]): Map<number, TimeSeriesPartition<T>[]> {
    const map = new Map<number, TimeSeriesPartition<T>[]>();
    partitions.forEach(p => {
      const year = p.period.start.getFullYear()
      const yearPartition = map.get(year);
      if (yearPartition === undefined) {
          map.set(year, [p]);
      } else {
        yearPartition.push(p);
      }
    })
    return map;
  }
}
