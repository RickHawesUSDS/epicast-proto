import { formAggregatesKey } from '@/epicast/feedStorageKeys'
import { MutableSnapshot } from '@/epicast/Snapshot'
import { TimeSeries } from '@/epicast/TimeSeries'
import { makeCasePartions, TimeSeriesPartition } from '@/epicast/TimeSeriesPartition'
import { Frequency } from '@/epicast/Frequency'
import { groupBy } from '@/utils/groupBy'
import { getLogger } from '@/utils/loggers'
import { stringify } from 'csv-string'
import { formatISO } from 'date-fns'

const logger = getLogger('PUBLISH_AGREGATES_SERVICE')

export async function publishAggregates (toSnapshot: MutableSnapshot, fromTimeSeries: TimeSeries): Promise<void> {
  const publisher = new AggregatesPublisher(toSnapshot, fromTimeSeries)
  await publisher.publish()
}

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
    const subject = this.timeSeries.summary.subject
    const reporter = this.timeSeries.summary.reporter
    const feed = this.timeSeries.summary.topic

    function createCSV (partitions: TimeSeriesPartition[]): string {
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

    const summary = this.timeSeries.summary
    const key = formAggregatesKey(summary.subject, summary.reporter, summary.topic, year)
    const report = createCSV(partitions)
    await this.snapshot.putObject(key, report)
  }
}
