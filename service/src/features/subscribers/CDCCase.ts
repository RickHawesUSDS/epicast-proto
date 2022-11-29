import { EventElementName, TimeSeriesEvent } from '@/epicast/TimeSeries'
import { Table, Column, Model, PrimaryKey, Index } from 'sequelize-typescript'

@Table({ tableName: 'cdcCases' })
export class CDCCase extends Model<CDCCase> implements TimeSeriesEvent {
  @PrimaryKey
  @Column
    eventId!: string

  @Index
  @Column
    eventAt!: Date

  @Column
    eventSubject!: string

  @Column
    eventReporter!: string

  @Column
    eventTopic!: string

  @Index
  @Column
    eventUpdatedAt!: Date

  @Column
    uscdiPatientDateOfBirth?: Date

  @Column
    uscdiPatientRaceCategory?: string

  @Column
    uscdiPatientEthnicityGroup?: string

  @Column
    uscdiPatientSexAtBirth?: string

  @Column
    uscdiPatientState?: string

  @Column
    uscdiPatientPostalCode?: string

  @Column
    cdcOnsetOfSymptoms!: Date

  @Column
    cdcHospitalized?: string

  @Column
    cdcSubjectDied?: string

  @Column
    us_caQuestion1?: string

  @Column
    us_caQuestion2?: string

  @Column
    us_caQuestion3?: string

  @Column
    cdcQuestion1?: string

  @Column
    cdcQuestion2?: string

  @Column
    cdcQuestion3?: string

  @Column
    us_azQuestion1?: string

  @Column
    us_azQuestion2?: string

  @Column
    us_azQuestion3?: string

  get eventIsDeleted (): boolean | undefined {
    return undefined
  }

  get eventReplacedBy (): string | undefined {
    return undefined
  }

  get model (): CDCCase {
    return this
  }

  getValue (name: EventElementName): any {
    if (name === 'eventIsDeleted' || name === 'eventReplacedBy') {
      return undefined
    } else {
      return this[name as keyof CDCCase]
    }
  }
}
