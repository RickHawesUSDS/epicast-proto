import { TimeSeriesEvent, EventElementName } from '@/epicast/TimeSeries'
import { Table, Column, Model, PrimaryKey, UpdatedAt, CreatedAt, Index } from 'sequelize-typescript'

@Table({ tableName: 'stateCases' })
export class StateCase extends Model<StateCase> implements TimeSeriesEvent<StateCase> {
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

  @Column
    eventIsDeleted?: boolean

  @Column
    eventReplacedBy?: string

  @Column
  @UpdatedAt
    eventUpdatedAt!: Date

  @CreatedAt
  @Column
    createdAt!: Date

  @Column
    uscdiPatientFirstName!: string

  @Column
    uscdiPatientLastName!: string

  @Column
    uscdiPatientDateOfBirth?: Date

  @Column
    uscdiPatientRaceCategory?: string

  @Column
    uscdiPatientEthnicityGroup?: string

  @Column
    uscdiPatientSexAtBirth?: string

  @Column
    uscdiPatientSexualOrientation?: string

  @Column
    uscdiPatientAddress?: string

  @Column
    uscdiPatientCity?: string

  @Column
    uscdiPatientState?: string

  @Column
    uscdiPatientPostalCode?: string

  @Column
    uscdiPatientPhone?: string

  @Column
    uscdiPatientEmail?: string

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

  get model (): StateCase {
    return this
  }

  getValue (name: EventElementName): any {
    return this[name as keyof StateCase]
  }
}
