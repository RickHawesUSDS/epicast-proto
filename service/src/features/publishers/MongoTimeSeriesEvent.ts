import { TimeSeriesEvent, EventElementName } from '@/epicast/TimeSeries'

export class MongoTimeSeriesEvent implements TimeSeriesEvent {
  eventId!: string
  eventAt!: Date
  eventSubject!: string
  eventReporter!: string
  eventTopic!: string
  eventIsDeleted?: boolean
  eventReplacedBy?: string
  eventUpdatedAt!: Date
  [name: string]: any

  getValue (name: EventElementName): any {
    return this[name]
  }

  get _id (): string {
    return this.eventId
  }
}
