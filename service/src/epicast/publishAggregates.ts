import { formAggregatesKey } from '@/epicast/feedStorageKeys'
import { MutableSnapshot } from '@/epicast/Snapshot'
import { TimeSeries } from '@/epicast/TimeSeries'
import { makeCasePartions, TimeSeriesPartition } from '@/epicast/TimeSeriesPartition'
import { Frequency } from '@/epicast/Frequency'
import { groupBy } from '@/utils/groupBy'
import { getLogger } from '@/utils/loggers'
import { stringify } from 'csv-string'
import { formatISO } from 'date-fns'
import { FeedSummary } from './FeedSummary'

const logger = getLogger('PUBLISH_AGREGATES_SERVICE')

export async function publishAggregates (toSnapshot: MutableSnapshot, fromTimeSeries: TimeSeries): Promise<void> {
  const publisher = new AggregatesPublisher(toSnapshot, fromTimeSeries)
  await publisher.publish()
}

// DevNote: this aggregator is just a first implementation. The stratifiers should
// should be specified as a publish option.

class AggregatesPublisher {
  snapshot: MutableSnapshot
  timeSeries: TimeSeries

  constructor (toSnapshot: MutableSnapshot, fromTimeSeries: TimeSeries) {
    this.snapshot = toSnapshot
    this.timeSeries = fromTimeSeries
  }

  async publish (): Promise<void> {
    logger.info('Publishing an aggregate')
    const events = await this.timeSeries.fetchEvents({ sortDescending: false })
    if (events.length === 0) return
    const partitions = makeCasePartions(events, Frequency.DAILY)
    const partitionsByYear = groupBy(partitions, item => item.period.start.getFullYear())
    for (const [year, yearPartition] of partitionsByYear) {
      await this.publishDailyCounts(year, yearPartition)
    }
  }

  async publishDailyCounts (year: number, partitions: TimeSeriesPartition[]): Promise<void> {
    const summary = this.timeSeries.summary
    const key = formAggregatesKey(summary.reporterId, summary.topicId, year)
    const report = this.createCSV(summary, partitions)
    await this.snapshot.putObject(key, report)
  }

  createCSV (summary: FeedSummary, partitions: TimeSeriesPartition[]): string {
    const csv = partitions.map(partition => {
      const rows: string[] = []
      const genderGrouping = groupBy(partition.events, (e) => e.getValue('uscdiPatientSexAtBirth'))
      for (const [gender, events] of genderGrouping) {
        const row = stringify(([summary.reporterId, summary.topicId, formatISO(partition.period.start), formatISO(partition.period.end), 'gender', gender, events.length]))
        rows.push(row)
      }
      const totalRow = stringify([summary.reporterId, summary.topicId, formatISO(partition.period.start), formatISO(partition.period.end), '', '', partition.events.length])
      rows.push(totalRow)
      return rows.join('')
    })
    csv.unshift(stringify(['reporter', 'topic', 'period-start', 'period-end', 'stratifier', 'stratum', 'count']))
    return csv.join('')
  }
}
