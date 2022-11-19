import { formAggregatesKey } from '@/epicast/feedBucketKeys'
import { MutableSnapshot } from '@/epicast/Snapshot'
import { TimeSeries } from '@/epicast/TimeSeries'
import { makeCasePartions, TimeSeriesPartition } from '@/epicast/TimeSeriesPartition'
import { Frequency } from '@/epicast/Frequency'
import { groupBy } from '@/utils/groupBy'
import { getLogger } from '@/utils/loggers'
import { stringify } from 'csv-string'
import { formatISO } from 'date-fns'

const logger = getLogger('PUBLISH_AGREGATES_SERVICE')

export async function publishAggregates<T>(toSnapshot: MutableSnapshot, fromTimeSeries: TimeSeries<T>): Promise<void> {
  const publisher = new AggregatesPublisher(toSnapshot, fromTimeSeries)
  await publisher.publish()
}

class AggregatesPublisher<T> {
  snapshot: MutableSnapshot
  timeSeries: TimeSeries<T>

  constructor(toSnapshot: MutableSnapshot, fromTimeSeries: TimeSeries<T>) {
    this.snapshot = toSnapshot
    this.timeSeries = fromTimeSeries
  }

  async publish(): Promise<void> {
    logger.info('Publishing an aggregate')
    const events = await this.timeSeries.findEvents({ sortDescending: false })
    if (events.length === 0) return
    const timeSeriesEvents = events.map(e => this.timeSeries.makeTimeSeriesEvent(e))
    const partitions = makeCasePartions(timeSeriesEvents, Frequency.DAILY)
    const partitionsByYear = groupBy(partitions, item => item.period.start.getFullYear())
    for (const [year, yearPartition] of partitionsByYear) {
      await this.publishDailyCounts(year, yearPartition)
    }
  }

  async publishDailyCounts<T>(year: number, partitions: Array<TimeSeriesPartition<T>>): Promise<void> {
    const subject = this.timeSeries.schema.subjectId
    const reporter = this.timeSeries.schema.reporterId
    const feed = this.timeSeries.schema.topicId

    function createCSV(partitions: Array<TimeSeriesPartition<T>>): string {
      const csv = partitions.map(partition => {
        const rows: string[] = []
        const genderGrouping = groupBy(partition.events, (e) => e.getValue('personSexAtBirth'))
        for (const [gender, events] of genderGrouping) {
          const row = stringify(([subject, reporter, feed, formatISO(partition.period.start), formatISO(partition.period.end), 'gender', gender, events.length]))
          rows.push(row)
        }
        const totalRow = stringify([subject, reporter, feed, formatISO(partition.period.start), formatISO(partition.period.end), '', '', partition.events.length])
        rows.push(totalRow)
        return rows.join('')
      })
      csv.unshift(stringify(['subject', 'reporter', 'feed', 'period-start', 'period-end', 'stratifier', 'stratum', 'count']))
      return csv.join('')
    }

    const schema = this.timeSeries.schema
    const key = formAggregatesKey(schema.subjectId, schema.reporterId, schema.topicId, year)
    const report = createCSV(partitions)
    await this.snapshot.putObject(key, report)
  }
}
